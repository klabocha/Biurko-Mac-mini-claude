"use client";

import { useState, useMemo } from "react";
import { properties, type PropertyType, type TransactionType } from "@/data/properties";
import PropertyCard from "./PropertyCard";

type SortOption = "newest" | "price-asc" | "price-desc" | "area-asc" | "area-desc";

export default function PropertyListings() {
  const [activeTransaction, setActiveTransaction] = useState<TransactionType | "all">("all");
  const [activeType, setActiveType] = useState<PropertyType | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showCount, setShowCount] = useState(9);

  const filtered = useMemo(() => {
    let result = [...properties];

    if (activeTransaction !== "all") {
      result = result.filter((p) => p.transaction === activeTransaction);
    }
    if (activeType !== "all") {
      result = result.filter((p) => p.type === activeType);
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "area-asc":
        result.sort((a, b) => a.area - b.area);
        break;
      case "area-desc":
        result.sort((a, b) => b.area - a.area);
        break;
      default:
        // newest first (by ID number desc)
        result.sort((a, b) => {
          const numA = parseInt(a.id.split("-").pop() || "0");
          const numB = parseInt(b.id.split("-").pop() || "0");
          return numB - numA;
        });
    }

    return result;
  }, [activeTransaction, activeType, sortBy]);

  const displayed = filtered.slice(0, showCount);

  const types: { value: PropertyType | "all"; label: string; count: number }[] = [
    { value: "all", label: "Wszystkie", count: properties.length },
    { value: "mieszkanie", label: "Mieszkania", count: properties.filter((p) => p.type === "mieszkanie").length },
    { value: "dom", label: "Domy", count: properties.filter((p) => p.type === "dom").length },
    { value: "działka", label: "Działki", count: properties.filter((p) => p.type === "działka").length },
    { value: "lokal", label: "Lokale", count: properties.filter((p) => p.type === "lokal").length },
    { value: "obiekt", label: "Obiekty", count: properties.filter((p) => p.type === "obiekt").length },
  ];

  return (
    <section id="oferty" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Nasze <span className="text-accent">oferty</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Przeglądaj naszą bazę sprawdzonych nieruchomości w Częstochowie i okolicach.
            Każda oferta jest weryfikowana przez naszych agentów.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          {/* Transaction filter */}
          <div className="flex gap-2">
            {(["all", "sprzedaż", "wynajem"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTransaction(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTransaction === t
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {t === "all" ? "Wszystkie" : t === "sprzedaż" ? "Sprzedaż" : "Wynajem"}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 focus:ring-2 focus:ring-accent"
          >
            <option value="newest">Najnowsze</option>
            <option value="price-asc">Cena: od najniższej</option>
            <option value="price-desc">Cena: od najwyższej</option>
            <option value="area-asc">Powierzchnia: od najmniejszej</option>
            <option value="area-desc">Powierzchnia: od największej</option>
          </select>
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {types.filter((t) => t.count > 0).map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveType(t.value)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                activeType === t.value
                  ? "bg-accent text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-500 mb-6">
          Znaleziono <span className="font-bold text-gray-800">{filtered.length}</span> ofert
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Load more */}
        {showCount < filtered.length && (
          <div className="text-center mt-10">
            <button
              onClick={() => setShowCount((prev) => prev + 9)}
              className="px-8 py-3 border-2 border-accent text-accent hover:bg-accent hover:text-white rounded-xl font-semibold transition-all"
            >
              Pokaż więcej ({filtered.length - showCount} pozostało)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
