"use client";

import { useState } from "react";
import { properties } from "@/data/properties";

export default function MapSection() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const districts = Array.from(new Set(properties.map((p) => p.district))).sort();

  const districtCounts = districts.reduce((acc, d) => {
    acc[d] = properties.filter((p) => p.district === d).length;
    return acc;
  }, {} as Record<string, number>);

  const districtAvgPrices = districts.reduce((acc, d) => {
    const sales = properties.filter((p) => p.district === d && p.transaction === "sprzedaż");
    if (sales.length > 0) {
      acc[d] = Math.round(sales.reduce((sum, p) => sum + p.pricePerM2, 0) / sales.length);
    }
    return acc;
  }, {} as Record<string, number>);

  const filteredProperties = selectedDistrict
    ? properties.filter((p) => p.district === selectedDistrict)
    : [];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Mapa <span className="text-accent">dzielnic</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Wybierz dzielnicę, aby zobaczyć dostępne oferty i średnie ceny za metr kwadratowy.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* District list */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-gray-800 mb-4">Dzielnice Częstochowy</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {districts.map((district) => (
                <button
                  key={district}
                  onClick={() => setSelectedDistrict(selectedDistrict === district ? null : district)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                    selectedDistrict === district
                      ? "bg-primary text-white shadow-md"
                      : "bg-surface hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div>
                    <div className="font-medium">{district}</div>
                    {districtAvgPrices[district] && (
                      <div className={`text-xs ${selectedDistrict === district ? "text-white/70" : "text-gray-400"}`}>
                        śr. {districtAvgPrices[district].toLocaleString("pl-PL")} zł/m²
                      </div>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${
                    selectedDistrict === district
                      ? "bg-white/20 text-white"
                      : "bg-accent/10 text-accent"
                  }`}>
                    {districtCounts[district]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Map placeholder / District detail */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 min-h-[500px] flex flex-col">
              {selectedDistrict ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">{selectedDistrict}</h3>
                    <span className="text-sm text-gray-500">
                      {filteredProperties.length} {filteredProperties.length === 1 ? "oferta" : "ofert"}
                    </span>
                  </div>

                  {districtAvgPrices[selectedDistrict] && (
                    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                      <div className="text-sm text-gray-500">Średnia cena za m²</div>
                      <div className="text-2xl font-bold text-primary">
                        {districtAvgPrices[selectedDistrict].toLocaleString("pl-PL")} zł/m²
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {filteredProperties.map((p) => (
                      <div key={p.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div>
                          <div className="font-medium text-gray-800">{p.title}</div>
                          <div className="text-sm text-gray-500">
                            {p.rooms ? `${p.rooms} pok. · ` : ""}{p.area} m² · {p.id}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            {p.price.toLocaleString("pl-PL")} zł
                            {p.transaction === "wynajem" ? "/mies." : ""}
                          </div>
                          <div className="text-xs text-gray-400">
                            {p.transaction === "sprzedaż" ? "sprzedaż" : "wynajem"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  {/* Stylized map of Częstochowa */}
                  <div className="relative w-full max-w-md mb-8">
                    <svg viewBox="0 0 400 300" className="w-full h-auto">
                      {/* City outline */}
                      <ellipse cx="200" cy="150" rx="180" ry="130" fill="none" stroke="#c9a84c" strokeWidth="2" strokeDasharray="8 4" opacity="0.3" />
                      {/* District dots */}
                      {[
                        { name: "Centrum", x: 200, y: 150 },
                        { name: "Grabówka", x: 150, y: 180 },
                        { name: "Parkitka", x: 160, y: 200 },
                        { name: "Tysiąclecie", x: 220, y: 130 },
                        { name: "Północ", x: 230, y: 90 },
                        { name: "Dźbów", x: 130, y: 140 },
                        { name: "Stare Miasto", x: 190, y: 160 },
                        { name: "Wrzosowiak", x: 170, y: 220 },
                        { name: "Raków", x: 260, y: 110 },
                      ].map((d) => (
                        <g key={d.name}>
                          <circle
                            cx={d.x}
                            cy={d.y}
                            r={Math.max(8, (districtCounts[d.name] || 1) * 3)}
                            fill="#1a365d"
                            opacity="0.2"
                          />
                          <circle
                            cx={d.x}
                            cy={d.y}
                            r="5"
                            fill="#c9a84c"
                            className="cursor-pointer hover:fill-[#1a365d] transition-colors"
                            onClick={() => setSelectedDistrict(d.name)}
                          />
                          <text
                            x={d.x}
                            y={d.y - 12}
                            textAnchor="middle"
                            fontSize="10"
                            fill="#374151"
                            fontWeight="600"
                          >
                            {d.name}
                          </text>
                          <text
                            x={d.x}
                            y={d.y + 18}
                            textAnchor="middle"
                            fontSize="8"
                            fill="#9ca3af"
                          >
                            {districtCounts[d.name] || 0} ofert
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <p className="text-gray-500">
                    Kliknij dzielnicę na mapie lub z listy, aby zobaczyć szczegóły
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
