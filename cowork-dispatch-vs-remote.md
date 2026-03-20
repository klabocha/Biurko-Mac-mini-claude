# Cowork Dispatch vs Claude Code Remote — wyjaśnienie

## Moja konfiguracja

- **Komputer firmowy** → zablokowany (Microsoft Authenticator, brak instalacji Claude, tajemnica firmy)
- **Mac mini prywatny** → Claude Code w terminalu (Opus, MCP, narzędzia)
- **Telefon** → Claude mobile
- **Używam:** Apple Mail, Excel, PowerPoint, przeglądarka, Claude Desktop

## Kluczowa różnica

| | **Claude Code Remote** | **Cowork Dispatch** |
|---|---|---|
| **Dla kogo** | Deweloperzy (terminal) | Profesjonaliści (GUI, biuro) |
| **Gdzie działa** | W terminalu, SSH, kod | Claude Desktop app, 38+ konektorów |
| **Co robi** | Pisze/edytuje kod, uruchamia testy | Automatyzuje zadania biurowe — pliki, email, Slack |
| **Interfejs** | Terminal + przeglądarka | Wizualny, bez kodu |
| **Kontekst** | Sesja kodowania | Persistent conversation (ciągła rozmowa) |

## Kiedy Dispatch > Claude Code (w mojej sytuacji)

1. **Jestem poza domem, z dala od terminala** — zlecam z telefonu zadanie na Maca, np. "przygotuj prezentację z danych w ~/projekty/raport.csv"
2. **Praca na plikach Office (Excel, PowerPoint)** — Dispatch przez konektory może bezpośrednio tworzyć/edytować pliki Office
3. **Ciągłość rozmowy bez sesji** — jedna ciągła rozmowa vs sesje w Claude Code
4. **Apple Mail / integracje bez MCP** — jeśli nie mam MCP do maila, Dispatch z konektorem jest prostszy
5. **Zadania gdy Mac pracuje, a ja nie** — odpalam z telefonu, wracam do wyników

## PROBLEM: Oddzielne pamięci

To jest kluczowy minus używania obu narzędzi jednocześnie.

| System | Gdzie pamięć | Format |
|---|---|---|
| **Claude Code** | `CLAUDE.md`, `~/.claude/` | Pliki projektowe, user memory |
| **Cowork/Desktop** | Chmura Anthropic | Persistent conversation + profile |
| **Claude mobile** | Chmura Anthropic | Historia czatów |

Te systemy **nie synchronizują się**. Cowork nie wie co robiłem w Claude Code i odwrotnie. To jak dwóch asystentów z osobnymi notatnikami.

### Konsekwencje

- Buduję kontekst w Claude Code (styl pracy, preferencje, projekty) → **Cowork tego nie widzi**
- Zlecam coś przez Dispatch → Claude zaczyna od zera, bez wiedzy o tym jak pracuję w terminalu
- Z czasem mam **dwa fragmenty "relacji"** zamiast jednej spójnej

## Decyzja: Claude Code jako główne narzędzie

Skoro zależy mi na ciągłości kontekstu, a większość pracy robię w Claude Code — **trzymam się jednego narzędzia jako głównego**.

### Strategia utrzymania kontekstu

1. **CLAUDE.md jako jedyne źródło prawdy** — preferencje, styl pracy, decyzje projektowe
2. **`claude --continue` / `--resume`** — kontynuacja sesji z pełnym kontekstem zamiast Dispatch
3. **`claude --remote-control`** — dostęp z telefonu gdy potrzebuję
4. **MCP serwery** (mail, kalendarz) w Claude Code — zamiast konektorów Cowork

### Kiedy mimo wszystko użyć Dispatch

- Zadania stricte biurowe na plikach Office, gdzie Claude Code nie ma przewagi
- Gdy nie mam dostępu do terminala ANI przeglądarki (tylko telefon)
- Jednorazowe zadania, gdzie brak kontekstu nie przeszkadza

## Wniosek

**Jedno narzędzie z pełnym kontekstem > dwa narzędzia z połówką każde.**

Dispatch to wygoda, nie konieczność. Przy mojej konfiguracji lepiej inwestować w dobrze utrzymany CLAUDE.md i MCP serwery niż rozbijać kontekst między dwa systemy.
