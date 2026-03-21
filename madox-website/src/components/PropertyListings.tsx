"use client";

import { useState, useMemo } from "react";
import { properties, type PropertyType, type TransactionType } from "@/data/properties";
import PropertyCard from "./PropertyCard";

type SortOption = "newest" | "price-asc" | "price-desc" | "area-asc" | "area-desc";

export default function PropertyListings() {
  const [activeTransaction, setActiveTransaction] = useState<TransactionType | "all">("all");
  const [activeType, setActiveType] = useState<PropertyType | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showCount, setShowCount] = useState(6);

  const filtered = useMemo(() => {
    let result = [...properties];
    if (activeTransaction !== "all") result = result.filter((p) => p.transaction === activeTransaction);
    if (activeType !== "all") result = result.filter((p) => p.type === activeType);
    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "area-asc": result.sort((a, b) => a.area - b.area); break;
      case "area-desc": result.sort((a, b) => b.area - a.area); break;
      default:
        result.sort((a, b) => parseInt(b.id.split("-").pop() || "0") - parseInt(a.id.split("-").pop() || "0"));
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
    <section id="oferty" className="py-24 bg-surface section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 pt-4">
          <span className="text-accent text-sm font-bold uppercase tracking-[0.2em]">Portfolio</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-3 mb-4">
            Nasze <span className="gradient-text-blue">oferty</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            Każda nieruchomość w naszej bazie jest sprawdzona i zweryfikowana przez doświadczonych agentów.
          </p>
        </div>

        {/* Filters bar */}
        <div className="glass rounded-2xl p-4 sm:p-5 mb-10 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Transaction tabs */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl">
              {(["all", "sprzedaż", "wynajem"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTransaction(t)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    activeTransaction === t
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
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
              className="px-4 py-2 border border-gray-200/60 rounded-xl bg-white/80 text-sm text-gray-600 focus:ring-2 focus:ring-accent/20"
            >
              <option value="newest">Najnowsze</option>
              <option value="price-asc">Cena: rosnąco</option>
              <option value="price-desc">Cena: malejąco</option>
              <option value="area-asc">Pow.: rosnąco</option>
              <option value="area-desc">Pow.: malejąco</option>
            </select>
          </div>

          {/* Type pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {types.filter((t) => t.count > 0).map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveType(t.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeType === t.value
                    ? "bg-gradient-to-r from-accent to-accent-dark text-white shadow-md shadow-accent/20"
                    : "bg-white/80 text-gray-500 hover:text-gray-700 border border-gray-200/60"
                }`}
              >
                {t.label} <span className="opacity-60">({t.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="text-sm text-gray-400 mb-8 flex items-center gap-2">
          <div className="w-1 h-4 bg-accent rounded-full" />
          Znaleziono <span className="font-bold text-gray-700">{filtered.length}</span> ofert
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayed.map((property, i) => (
            <PropertyCard key={property.id} property={property} index={i} />
          ))}
        </div>

        {/* Load more */}
        {showCount < filtered.length && (
          <div className="text-center mt-14">
            <button
              onClick={() => setShowCount((prev) => prev + 6)}
              className="group px-10 py-4 border-2 border-gray-200 hover:border-accent text-gray-500 hover:text-accent rounded-xl font-bold transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Pokaż więcej
                <span className="text-sm opacity-60">({filtered.length - showCount})</span>
                <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
