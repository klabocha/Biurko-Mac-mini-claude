"use client";

import { companyInfo } from "@/data/properties";

export default function ValuationBanner() {
  return (
    <section className="py-16 bg-gradient-to-r from-accent to-accent-dark text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 border-2 border-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Chcesz poznać wartość swojej nieruchomości?
            </h2>
            <p className="text-white/80 text-lg max-w-2xl">
              Bezpłatna wycena nieruchomości. Skontaktuj się z nami — pomożemy ustalić optymalną cenę sprzedaży.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`tel:${companyInfo.phones[0].replace(/-/g, "")}`}
              className="px-8 py-4 bg-white text-accent-dark font-bold rounded-xl hover:bg-gray-100 transition-all hover:shadow-xl text-center"
            >
              Zadzwoń: {companyInfo.phones[0]}
            </a>
            <a
              href="#kontakt"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all text-center"
            >
              Napisz do nas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
