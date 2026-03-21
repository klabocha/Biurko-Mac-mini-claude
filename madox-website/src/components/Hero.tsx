"use client";

import { useState } from "react";
import { properties, type PropertyType, type TransactionType } from "@/data/properties";

const propertyTypes: { value: PropertyType | "all"; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "mieszkanie", label: "Mieszkania" },
  { value: "dom", label: "Domy" },
  { value: "działka", label: "Działki" },
  { value: "lokal", label: "Lokale" },
];

export default function Hero() {
  const [transaction, setTransaction] = useState<TransactionType>("sprzedaż");
  const [type, setType] = useState<PropertyType | "all">("all");
  const [priceMax, setPriceMax] = useState("");
  const [areaMin, setAreaMin] = useState("");

  const totalOffers = properties.length;
  const salesCount = properties.filter((p) => p.transaction === "sprzedaż").length;
  const rentalCount = properties.filter((p) => p.transaction === "wynajem").length;

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("transaction", transaction);
    if (type !== "all") params.set("type", type);
    if (priceMax) params.set("priceMax", priceMax);
    if (areaMin) params.set("areaMin", areaMin);
    document.getElementById("oferty")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary/80 to-primary-dark/90" />
      </div>

      {/* Floating stats */}
      <div className="absolute top-32 right-8 hidden lg:flex flex-col gap-4 animate-fade-in-up delay-400">
        <div className="glass rounded-2xl p-4 text-center shadow-xl">
          <div className="text-3xl font-bold text-primary">{totalOffers}</div>
          <div className="text-xs text-gray-600">aktywnych ofert</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center shadow-xl">
          <div className="text-3xl font-bold text-accent">{salesCount}</div>
          <div className="text-xs text-gray-600">na sprzedaż</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center shadow-xl">
          <div className="text-3xl font-bold text-green-600">{rentalCount}</div>
          <div className="text-xs text-gray-600">na wynajem</div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-32 pb-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8 animate-fade-in-up">
          <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span className="text-white/90 text-sm font-medium">20 lat doświadczenia w Częstochowie</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up delay-100 leading-tight">
          Znajdź swój wymarzony
          <span className="block gradient-text">dom z MADOX</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/80 mb-12 max-w-2xl mx-auto animate-fade-in-up delay-200">
          Z nami bezpiecznie do własnego domu. Profesjonalna obsługa, sprawdzone oferty i pełne wsparcie na każdym etapie transakcji.
        </p>

        {/* Search box */}
        <div className="glass rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto animate-fade-in-up delay-300">
          {/* Transaction toggle */}
          <div className="flex justify-center gap-2 mb-6">
            {(["sprzedaż", "wynajem"] as TransactionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setTransaction(t)}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                  transaction === t
                    ? "bg-primary text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t === "sprzedaż" ? "Kupno" : "Wynajem"}
              </button>
            ))}
          </div>

          {/* Search fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 text-left">Typ nieruchomości</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType | "all")}
                className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              >
                {propertyTypes.map((pt) => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 text-left">Lokalizacja</label>
              <select className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-accent focus:border-transparent transition-all">
                <option value="">Cała Częstochowa</option>
                <option value="Centrum">Centrum</option>
                <option value="Grabówka">Grabówka</option>
                <option value="Parkitka">Parkitka</option>
                <option value="Tysiąclecie">Tysiąclecie</option>
                <option value="Północ">Północ</option>
                <option value="Dźbów">Dźbów</option>
                <option value="Wrzosowiak">Wrzosowiak</option>
                <option value="Raków">Raków</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 text-left">Cena do (zł)</label>
              <input
                type="number"
                placeholder={transaction === "sprzedaż" ? "np. 500 000" : "np. 2 500"}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 text-left">Pow. od (m²)</label>
              <input
                type="number"
                placeholder="np. 40"
                value={areaMin}
                onChange={(e) => setAreaMin(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="mt-6 w-full sm:w-auto px-10 py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Szukaj nieruchomości
          </button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-in-up delay-400">
          {[
            { icon: "🏠", label: `${totalOffers}+ ofert` },
            { icon: "⭐", label: "20 lat na rynku" },
            { icon: "🤝", label: "Bez prowizji*" },
            { icon: "📋", label: "Pełna obsługa" },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-white/80">
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
