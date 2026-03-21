"use client";

import { companyInfo } from "@/data/properties";

export default function ValuationBanner() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light" />

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-2xl" />
        <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 opacity-[0.03]" viewBox="0 0 200 200">
          <path d="M100 0 L200 100 L100 200 L0 100 Z" fill="white" />
          <path d="M100 20 L180 100 L100 180 L20 100 Z" fill="none" stroke="white" strokeWidth="1" />
          <path d="M100 40 L160 100 L100 160 L40 100 Z" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/20 rounded-full px-4 py-1.5 mb-6">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-accent-light text-sm font-semibold">Bezpłatna usługa</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
              Chcesz poznać wartość
              <span className="block gradient-text">swojej nieruchomości?</span>
            </h2>
            <p className="text-white/50 text-lg max-w-lg leading-relaxed">
              Profesjonalna wycena oparta o 20 lat doświadczenia na rynku częstochowskim. Pomożemy ustalić optymalną cenę sprzedaży.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
            <a
              href={`tel:${companyInfo.phones[0].replace(/-/g, "")}`}
              className="btn-premium px-8 py-4 bg-accent text-white font-bold rounded-xl text-center text-lg"
            >
              Zadzwoń: {companyInfo.phones[0]}
            </a>
            <a
              href="#kontakt"
              className="px-8 py-4 border-2 border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-center"
            >
              Napisz do nas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
