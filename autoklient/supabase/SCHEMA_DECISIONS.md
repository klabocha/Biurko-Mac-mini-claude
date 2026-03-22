# AutoKlient Database Schema - Architectural Decisions

This document records all decisions made during schema design, answering questions A through H from the design brief.

---

## A. Encryption Strategy

**Decision: Option 1 - AES-256-GCM at the application layer.**

### Why not Supabase Vault (pgsodium)?

- Supabase Vault is excellent but adds Supabase-specific lock-in. If we ever migrate away from Supabase, we need to re-encrypt everything.
- Vault's transparent column encryption (TCE) works at the column level but has limited tooling for key rotation.
- Vault keys are managed via Supabase dashboard/API, which complicates CI/CD and local development.

### Why not pgcrypto?

- pgcrypto's `pgp_sym_encrypt` works but the encryption key must be passed in every query, which means the key appears in query logs, `pg_stat_statements`, and potentially error messages.
- No authenticated encryption (no GCM mode) - pgcrypto uses CFB mode which doesn't detect tampering.

### Why application-layer AES-256-GCM?

1. **Key management**: The encryption key lives in environment variables (`GOOGLE_TOKEN_ENCRYPTION_KEY`), never touches the database.
2. **Authenticated encryption**: GCM mode detects tampering.
3. **Portable**: Works with any PostgreSQL host, not just Supabase.
4. **Auditable**: Key rotation is a simple application operation (decrypt with old key, encrypt with new key, update row).
5. **RLS compatible**: RLS policies never need to decrypt tokens. RLS checks `business_id`/`owner_id`, not token values.

### Implementation

```
-- Columns in businesses table:
google_access_token_encrypted   text,  -- base64(iv + ciphertext + auth_tag)
google_refresh_token_encrypted  text,
google_token_expires_at         timestamptz,  -- stored in plaintext (not sensitive)
```

Application code (pseudocode):
```typescript
// Encrypt before INSERT/UPDATE
const encrypted = aes256gcm.encrypt(refreshToken, process.env.GOOGLE_TOKEN_ENCRYPTION_KEY);
await supabase.from('businesses').update({ google_refresh_token_encrypted: encrypted });

// Decrypt after SELECT
const { data } = await supabase.from('businesses').select('google_refresh_token_encrypted');
const refreshToken = aes256gcm.decrypt(data.google_refresh_token_encrypted, process.env.GOOGLE_TOKEN_ENCRYPTION_KEY);
```

---

## B. Multi-Tenant Isolation

### RLS Performance

**Question**: Is `business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())` performant at 10k+ rows?

**Answer**: Yes, with caveats.

1. The subquery is executed once per statement (PostgreSQL caches `STABLE` function results).
2. With the index `idx_businesses_owner_id ON businesses (owner_id) WHERE deleted_at IS NULL`, the subquery is an index scan returning 1-5 rows (a user has 1-5 businesses).
3. The `IN (...)` with 1-5 UUIDs becomes a simple equality check, which the business_id indexes on child tables handle efficiently.
4. At 10k rows per table per business, this is trivial. At 1M+ rows total across all businesses, it's still fine because the child table indexes on `business_id` do the heavy lifting.

**Decision**: Use `get_user_business_ids()` helper function.

```sql
-- This function is STABLE and SECURITY DEFINER
CREATE FUNCTION get_user_business_ids() RETURNS SETOF uuid AS $$
    SELECT id FROM businesses WHERE owner_id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Used in policies:
CREATE POLICY customers_select ON customers FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()) AND deleted_at IS NULL);
```

### Why a helper function?

1. **DRY**: Changed once, applies everywhere.
2. **Cacheable**: `STABLE` tells PostgreSQL the function returns the same result within a single statement.
3. **Future-proof**: If we add team members (multiple users per business), we change only this function.
4. **SECURITY DEFINER**: Runs as the function owner, bypassing RLS on the businesses table itself (avoids infinite recursion).

### Service-Role Access (n8n)

Supabase's service_role key bypasses RLS automatically. No special policies needed.

```typescript
// n8n uses service_role key - sees ALL rows, no RLS applied
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
```

The `is_service_role()` helper function is available for triggers that need to distinguish user vs. system operations (e.g., preventing user-initiated audit_log deletion while allowing system cleanup).

---

## C. Soft Delete Strategy

### Which tables need soft delete?

| Table | Soft Delete | Reason |
|-------|-------------|--------|
| businesses | Yes | RODO: must retain record of data processing |
| customers | Yes | RODO: must prove deletion happened |
| reviews | Yes | May need to restore accidentally deleted reviews |
| sms_templates | Yes | Prevent breaking active automations |
| email_templates | Yes | Same as sms_templates |
| subscriptions | No | Subscriptions have status lifecycle (cancelled, expired) |
| jobs | No | Jobs have status lifecycle (completed, failed, cancelled) |
| sms_log | No | Immutable - never deleted (audit trail) |
| email_log | No | Immutable - never deleted (audit trail) |
| audit_log | No | Immutable - retention-based cleanup only |
| analytics_events | No | Append-only - retention-based cleanup only |
| google_token_refresh_log | No | Diagnostic - retention-based cleanup only |

### Implementation: `deleted_at` column

```sql
deleted_at timestamptz  -- NULL = active, non-NULL = deleted
```

**Why not archive tables?**
- Archive tables require maintaining duplicate schemas.
- Every schema change needs to be applied to both tables.
- Querying across active + archived data is complex.
- `deleted_at` with partial indexes is simpler and well-understood.

### Soft Delete + UNIQUE Constraints

Problem: If customer phone `+48600111222` is soft-deleted and a new customer with the same phone is created, a normal UNIQUE constraint would block it.

Solution: **Partial unique indexes** that only cover active rows:

```sql
CREATE UNIQUE INDEX uq_customers_business_phone_active
    ON customers (business_id, phone) WHERE deleted_at IS NULL;
```

This allows:
- Active row: business_1, +48600111222, deleted_at = NULL ✓
- Soft-deleted row: business_1, +48600111222, deleted_at = '2024-01-15' ✓ (ignored by index)
- New active row: business_1, +48600111222, deleted_at = NULL → CONFLICT (correctly blocked)

### Soft Delete + RLS

Every SELECT policy includes `AND deleted_at IS NULL`:

```sql
CREATE POLICY customers_select ON customers FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_business_ids()) AND deleted_at IS NULL);
```

This means soft-deleted rows are invisible to authenticated users. Only service-role (n8n) can see them for RODO compliance reporting.

### Soft Delete Trigger

The `soft_delete()` trigger intercepts DELETE and converts it to an UPDATE:

```sql
CREATE TRIGGER trg_customers_soft_delete
    BEFORE DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION soft_delete();
```

This means application code can use normal `supabase.from('customers').delete().eq('id', id)` and it "just works" as a soft delete.

---

## D. Audit Log

### Decision: Trigger-based automatic auditing

**Why trigger-based?**
1. Cannot be bypassed by application bugs.
2. Captures service-role (n8n) changes too.
3. Uniform JSONB format for all tables.
4. Zero application code needed.

**Why not application-level?**
- Requires every code path to remember to log.
- Service-role operations (n8n) would need separate audit logic.
- Easy to forget during refactoring.

### Audited Tables

| Table | Audited | Why |
|-------|---------|-----|
| businesses | Yes | Core entity, RODO |
| customers | Yes | PII, RODO |
| subscriptions | Yes | Billing changes |
| sms_templates | Yes | Track template modifications |
| jobs | No | Too noisy (status changes every few seconds) |
| sms_log | No | Already immutable (IS the audit trail for SMS) |
| email_log | No | Already immutable |
| audit_log | No | Self-referential auditing is unnecessary |
| analytics_events | No | Too noisy, not compliance-relevant |
| reviews | No | Fetched from external source, low compliance risk |

### Audit Log Schema

```sql
CREATE TABLE audit_log (
    id          uuid PRIMARY KEY,
    table_name  text NOT NULL,        -- 'customers', 'businesses', etc.
    record_id   uuid,                 -- PK of the changed row
    action      audit_action NOT NULL, -- INSERT, UPDATE, DELETE, SOFT_DELETE, RESTORE
    old_data    jsonb,                -- full row before change (NULL for INSERT)
    new_data    jsonb,                -- full row after change (NULL for DELETE)
    business_id uuid,                 -- denormalized for RLS
    user_id     uuid,                 -- auth.uid() or NULL for service role
    ip_address  inet,                 -- from request headers
    created_at  timestamptz NOT NULL
);
```

### Retention Policy

- **2 years** for RODO compliance (Polish law requires data processing records).
- Cleanup via scheduled n8n job:
  ```sql
  DELETE FROM audit_log WHERE created_at < now() - interval '2 years';
  ```
- The `trg_audit_log_prevent_delete` trigger only allows service-role to delete.
- `google_token_refresh_log`: 30-day retention (diagnostic only).
- `analytics_events`: 1-year retention.

---

## E. Jobs Table vs. SMS/Email Log Tables

**Decision: Jobs = Queue, Logs = Outcome.**

### The Pattern

```
User action → INSERT INTO jobs (type='send_sms', status='pending')
                    ↓
n8n polls  → SELECT FROM jobs WHERE status='pending' ORDER BY scheduled_at
                    ↓
n8n sends  → UPDATE jobs SET status='completed'
                    ↓
n8n logs   → INSERT INTO sms_log (status='sent', provider_message_id='...')
```

### Why two tables?

1. **Different lifecycles**: A job is temporary (pending → completed/failed). A log entry is permanent.
2. **Retry semantics**: Failed jobs can be retried without creating duplicate log entries. The log only records actual send attempts.
3. **Scheduling**: Jobs have `scheduled_at` for future execution. Logs record `sent_at` for when it actually happened.
4. **Cancellation**: Pending jobs can be cancelled. You can't "cancel" a log entry.
5. **Billing**: `sms_log` with `segments_count` and `cost_pln` is the source of truth for billing. Jobs don't track cost.
6. **Analytics**: "How many SMS were delivered this month?" → query `sms_log`. "How many SMS are waiting to be sent?" → query `jobs`.

### Could we merge them?

Yes, but it would create a table trying to serve two purposes (queue + audit), leading to:
- Complex status machines
- Difficulty distinguishing "scheduled but not sent" from "sent and delivered"
- Awkward `scheduled_at` vs. `sent_at` vs. `created_at` semantics

The current design keeps each table focused on one responsibility.

---

## F. Index Strategy

See migration `007_indexes.sql` for the full index list. Key decisions:

### RLS Performance

The most critical index is:
```sql
CREATE INDEX idx_businesses_owner_id ON businesses (owner_id) WHERE deleted_at IS NULL;
```
Every RLS policy calls `get_user_business_ids()` which executes `SELECT id FROM businesses WHERE owner_id = auth.uid() AND deleted_at IS NULL`. This index makes it an instant lookup.

### Partial Indexes

We use partial indexes extensively to:
1. Exclude soft-deleted rows (matches RLS policy filters).
2. Target specific statuses (e.g., `WHERE status = 'pending'` for job polling).
3. Keep index size small and maintenance cost low.

### Job Polling Index

```sql
CREATE INDEX idx_jobs_pending_poll ON jobs (scheduled_at, priority DESC) WHERE status = 'pending';
```
This is the highest-throughput query in the system. n8n polls every few seconds for pending jobs.

### Top 10 Query Patterns

1. List businesses for user → `idx_businesses_owner_id`
2. List customers for business → `idx_customers_business_created`
3. Search customers by name → `idx_customers_name_trgm`
4. List reviews newest first → `idx_reviews_business_date`
5. Poll pending jobs → `idx_jobs_pending_poll`
6. SMS history for business → `idx_sms_log_business_created`
7. SMS delivery stats → `idx_sms_log_business_status_created`
8. Provider callback lookup → `idx_sms_log_provider_message_id`
9. Subscription check → `idx_subscriptions_business` + `uq_subscriptions_business_active`
10. Audit trail for record → `idx_audit_log_table_record`

---

## G. Migration Strategy

### Directory Structure

```
autoklient/
  supabase/
    migrations/
      001_extensions_and_functions.sql
      002_core_tables.sql
      003_operational_tables.sql
      004_sms_templates.sql
      005_audit_and_analytics.sql
      006_rls_policies.sql
      007_indexes.sql
      008_triggers.sql
      009_seed_data.sql
    config.toml
```

### Versioning

- Migrations are numbered sequentially (001, 002, ...).
- In production, Supabase CLI converts these to timestamped filenames automatically.
- Each migration is idempotent where possible (using `IF NOT EXISTS`, `CREATE OR REPLACE`).

### Running Migrations

```bash
# Local development
supabase db reset          # drops and recreates from migrations

# Staging/Production
supabase db push           # applies pending migrations
supabase migration list    # shows migration status
```

### Data Migrations

For data migrations (e.g., backfilling a new column):
1. Create a new migration file with the DML statements.
2. Wrap in a transaction (migrations are transactional by default).
3. Use `DO $$ ... $$` blocks for complex logic.

### Rollback Strategy

Supabase CLI does not support automatic rollback. Strategy:
1. **Prevention**: Test migrations on local Supabase first (`supabase db reset`).
2. **Forward-fix**: If a migration fails in production, write a new migration that undoes the change.
3. **Backup**: Take a database backup before applying migrations (`pg_dump`).
4. Each migration file should have a comment block documenting how to undo it manually.

---

## H. Seed Data

### System Defaults (Production)

Migration `009_seed_data.sql` contains system default templates that are inserted in all environments. These are the starting point for all businesses.

### Development Data

Development seed data is wrapped in a conditional block:
```sql
DO $$
BEGIN
    IF current_setting('app.environment', true) = 'development' THEN
        -- Insert test business, customers, etc.
    END IF;
END;
$$;
```

To seed dev data:
```bash
# Option 1: Set environment before migration
SET app.environment = 'development';

# Option 2: Use Supabase seed.sql (recommended)
# Copy dev data into supabase/seed.sql, runs on `supabase db reset`
```

### Test Data Contents

- 1 test business (OSK "Auto Szkola Mistrz")
- 3 test customers (with varying consent states)
- 3 test reviews (5-star, 4-star, 3-star)
- 1 pending SMS job
- 1 trial subscription (auto-created by trigger)

---

## SMS Templates System

### Storage: Database (not config files)

**Why?**
1. Users can customize templates per business.
2. System defaults are rows with `business_id = NULL`.
3. Database storage enables analytics (which template performs best?).
4. No deployment needed to add/change templates.
5. RLS naturally controls access.

### Template Resolution Order

When sending an SMS for a business:
1. Check for a **business-specific** template (`business_id = X, template_type = Y, is_default = true`).
2. Fall back to **industry default** (`business_id = NULL, industry = Z, template_type = Y, is_default = true`).
3. Fall back to **universal default** (`business_id = NULL, industry = NULL, template_type = Y, is_default = true`).

```sql
-- Template resolution query
SELECT * FROM sms_templates
WHERE (business_id = $1 OR business_id IS NULL)
  AND template_type = $2
  AND is_default = true
  AND is_active = true
  AND deleted_at IS NULL
ORDER BY
  business_id NULLS LAST,  -- business-specific first
  CASE WHEN industry = $3 THEN 0 ELSE 1 END  -- matching industry second
LIMIT 1;
```

### Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{business_name}` | Business name | "Auto Szkola Mistrz" |
| `{customer_name}` | Customer name | "Jan Kowalski" |
| `{review_link}` | Google review URL | "https://g.page/r/..." |
| `{followup_days}` | Days since first request | "7" |

Variables are validated and substituted at the application layer before sending. Unknown variables are left as-is (not stripped) to make errors visible.

### User Customization

Users can:
1. **Clone** a system template → creates a business-specific copy.
2. **Edit** their own templates → business_id must match.
3. **Set default** → one default per type per business (enforced by unique index).
4. **Cannot** edit system defaults (enforced by RLS: `business_id IS NOT NULL` in UPDATE/DELETE policies).

### Polish SMS Character Considerations

Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż) force UCS-2 encoding:
- GSM-7 (ASCII): 160 chars per segment
- UCS-2 (Polish): 70 chars per segment

Templates should be crafted with this in mind. The `message_template` column allows up to 640 chars (4 UCS-2 segments or ~4 GSM-7 segments).

---

## Entity Relationship Summary

```
auth.users (Supabase Auth)
    │
    ▼ owner_id
businesses ──────────────────────────────────────────┐
    │                                                 │
    ├── customers                                     │
    │       │                                         │
    │       ├── reviews (customer_id nullable)         │
    │       ├── sms_log (customer_id nullable)        │
    │       ├── email_log (customer_id nullable)      │
    │       └── jobs (customer_id nullable)           │
    │                                                 │
    ├── subscriptions (1:1 active per business)       │
    ├── sms_templates (business_id nullable = system) │
    ├── email_templates (same pattern)                │
    ├── google_token_refresh_log                      │
    ├── analytics_events                              │
    └── audit_log (business_id denormalized)          │
                                                      │
    jobs.job_id ←── sms_log.job_id                   │
    jobs.job_id ←── email_log.job_id                  │
    sms_templates.id ←── sms_log.template_id         │
```

---

## Table Count Summary

| # | Table | Rows (estimate @ 1000 businesses) | Soft Delete | Audited | RLS |
|---|-------|-----------------------------------|-------------|---------|-----|
| 1 | businesses | 1,000 | Yes | Yes | Yes |
| 2 | customers | 100,000 | Yes | Yes | Yes |
| 3 | reviews | 50,000 | Yes | No | Yes |
| 4 | subscriptions | 1,000 | No | Yes | Yes |
| 5 | jobs | 500,000 | No | No | Yes |
| 6 | sms_log | 1,000,000 | No | No | Yes |
| 7 | email_log | 100,000 | No | No | Yes |
| 8 | sms_templates | 500 | Yes | Yes | Yes |
| 9 | email_templates | 200 | Yes | No | Yes |
| 10 | google_token_refresh_log | 30,000 | No | No | Yes |
| 11 | audit_log | 500,000 | No | No | Yes |
| 12 | analytics_events | 2,000,000 | No | No | Yes |

**Total: 12 tables, all with RLS enabled.**
