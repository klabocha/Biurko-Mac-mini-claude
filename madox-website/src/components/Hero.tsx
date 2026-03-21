"use client";

import { useState, useEffect } from "react";
import { properties, type PropertyType, type TransactionType } from "@/data/properties";

const propertyTypes: { value: PropertyType | "all"; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "mieszkanie", label: "Mieszkania" },
  { value: "dom", label: "Domy" },
  { value: "działka", label: "Działki" },
  { value: "lokal", label: "Lokale" },
];

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span className="stat-number">{count}{suffix}</span>;
}

export default function Hero() {
  const [transaction, setTransaction] = useState<TransactionType>("sprzedaż");
  const [type, setType] = useState<PropertyType | "all">("all");
  const [priceMax, setPriceMax] = useState("");
  const [areaMin, setAreaMin] = useState("");

  const totalOffers = properties.length;

  const handleSearch = () => {
    document.getElementById("oferty")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary-dark">
      {/* Layered background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop&q=80')",
            filter: "brightness(0.3) contrast(1.1)",
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/80 via-primary-dark/40 to-primary-dark/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/60 via-transparent to-primary-dark/60" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Rotating ring */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] animate-rotate-slow opacity-[0.04]">
          <svg viewBox="0 0 500 500" fill="none">
            <circle cx="250" cy="250" r="200" stroke="#d4a853" strokeWidth="1" strokeDasharray="12 8" />
            <circle cx="250" cy="250" r="230" stroke="#d4a853" strokeWidth="0.5" strokeDasharray="4 12" />
          </svg>
        </div>
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <svg viewBox="0 0 128 128" fill="none" className="opacity-20">
            <path d="M0 0 L128 0 L0 128 Z" fill="url(#gold-grad)" />
            <defs><linearGradient id="gold-grad" x1="0" y1="0" x2="128" y2="128"><stop stopColor="#d4a853" /><stop offset="1" stopColor="transparent" /></linearGradient></defs>
          </svg>
        </div>
        {/* Floating dots */}
        <div className="absolute top-1/4 left-[10%] w-2 h-2 rounded-full bg-accent/30 animate-float" />
        <div className="absolute top-1/3 right-[15%] w-1.5 h-1.5 rounded-full bg-accent/20 animate-float delay-200" />
        <div className="absolute bottom-1/3 left-[20%] w-1 h-1 rounded-full bg-accent/25 animate-float delay-400" />
        {/* Horizontal accent line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left column - text */}
          <div className="lg:col-span-5 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 glass-dark rounded-full px-5 py-2.5 mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="text-accent-light text-sm font-medium tracking-wide">
                20 lat zaufania w Częstochowie
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-fade-in-up delay-100 leading-[1.1] tracking-tight">
              Twój nowy
              <span className="block mt-2">
                <span className="gradient-text">dom czeka</span>
              </span>
            </h1>

            <p className="text-lg text-white/60 mb-10 max-w-lg animate-fade-in-up delay-200 leading-relaxed">
              Kancelaria Obrotu Nieruchomościami MADOX. Profesjonalna obsługa, sprawdzone oferty i pełne wsparcie na każdym etapie transakcji.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 animate-fade-in-up delay-300">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter target={totalOffers} suffix="+" />
                </div>
                <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Ofert</div>
              </div>
              <div className="w-px h-12 bg-white/10 hidden sm:block" />
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-accent">
                  <AnimatedCounter target={20} />
                </div>
                <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Lat doświadczenia</div>
              </div>
              <div className="w-px h-12 bg-white/10 hidden sm:block" />
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter target={4} />
                </div>
                <div className="text-xs text-white/40 uppercase tracking-widest mt-1">Agentów</div>
              </div>
            </div>
          </div>

          {/* Right column - search */}
          <div className="lg:col-span-7 animate-fade-in-up delay-300">
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 bg-accent/5 rounded-[2rem] blur-2xl" />

              <div className="relative glass rounded-[1.5rem] p-6 sm:p-8 shadow-2xl border border-white/10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-800">Wyszukaj nieruchomość</h2>
                  <div className="flex gap-1.5">
                    {(["sprzedaż", "wynajem"] as TransactionType[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTransaction(t)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                          transaction === t
                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                            : "bg-gray-100/80 text-gray-500 hover:bg-gray-200/80"
                        }`}
                      >
                        {t === "sprzedaż" ? "Kupno" : "Wynajem"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Typ</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as PropertyType | "all")}
                      className="w-full p-3.5 bg-gray-50/80 border border-gray-200/60 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                    >
                      {propertyTypes.map((pt) => (
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Lokalizacja</label>
                    <select className="w-full p-3.5 bg-gray-50/80 border border-gray-200/60 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all">
                      <option value="">Cała Częstochowa</option>
                      <option>Centrum</option>
                      <option>Grabówka</option>
                      <option>Parkitka</option>
                      <option>Tysiąclecie</option>
                      <option>Północ</option>
                      <option>Dźbów</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Budżet do</label>
                    <input
                      type="number"
                      placeholder={transaction === "sprzedaż" ? "np. 500 000 zł" : "np. 2 500 zł"}
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="w-full p-3.5 bg-gray-50/80 border border-gray-200/60 rounded-xl text-gray-800 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pow. od (m²)</label>
                    <input
                      type="number"
                      placeholder="np. 40"
                      value={areaMin}
                      onChange={(e) => setAreaMin(e.target.value)}
                      className="w-full p-3.5 bg-gray-50/80 border border-gray-200/60 rounded-xl text-gray-800 font-medium placeholder:text-gray-300 focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  className="btn-premium w-full py-4 bg-gradient-to-r from-accent to-accent-dark text-white font-bold rounded-xl text-lg tracking-wide"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Szukaj nieruchomości
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom trust bar */}
      <div className="absolute bottom-0 left-0 right-0 glass-dark border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-2">
            {[
              { label: "Bezpłatna wycena", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { label: "Bez ukrytych prowizji", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
              { label: "Pełna obsługa prawna", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
              { label: "Doradztwo kredytowe", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-white/50 hover:text-accent transition-colors">
                <svg className="w-4 h-4 text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                <span className="text-xs font-medium tracking-wide">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
