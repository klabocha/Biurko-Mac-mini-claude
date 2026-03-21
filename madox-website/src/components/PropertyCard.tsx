"use client";

import Image from "next/image";
import { type Property } from "@/data/properties";

function formatPrice(price: number, transaction: string): string {
  if (transaction === "wynajem") {
    return `${price.toLocaleString("pl-PL")} zł/mies.`;
  }
  return `${price.toLocaleString("pl-PL")} zł`;
}

export default function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const p = property;

  return (
    <div
      className="premium-card bg-white group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image section */}
      <div className="property-image-wrapper h-64 relative">
        <Image
          src={p.images[0]}
          alt={p.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Top badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {p.isNew && (
            <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
              Nowa
            </span>
          )}
          {p.isSpecial && (
            <span className="bg-gradient-to-r from-accent to-accent-dark text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
              Wyróżniona
            </span>
          )}
          {p.hasVideo && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 uppercase tracking-wider">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Video
            </span>
          )}
        </div>

        {/* Transaction type */}
        <div className="absolute top-4 right-4 z-10">
          <span className={`backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${
            p.transaction === "sprzedaż" ? "bg-primary/80" : "bg-blue-600/80"
          }`}>
            {p.transaction === "sprzedaż" ? "Sprzedaż" : "Wynajem"}
          </span>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <div className="text-white font-bold text-2xl tracking-tight">{formatPrice(p.price, p.transaction)}</div>
          {p.transaction === "sprzedaż" && (
            <div className="text-white/60 text-sm font-medium">{p.pricePerM2.toLocaleString("pl-PL")} zł/m²</div>
          )}
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 z-[5] opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] group-hover:left-[150%] transition-all duration-1000" />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-primary transition-colors">{p.title}</h3>

        <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {p.location}
        </div>

        {/* Features chips */}
        <div className="flex items-center gap-3 text-sm text-gray-500 pb-4 border-b border-gray-100">
          {p.rooms && (
            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">{p.rooms} {p.rooms === 1 ? "pokój" : p.rooms < 5 ? "pokoje" : "pokoi"}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="font-medium">{p.area} m²</span>
          </div>
        </div>

        {/* Agent bar */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold shadow-md">
              {p.agent.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-700 block">{p.agent}</span>
              <span className="text-[10px] text-gray-400">{p.id}</span>
            </div>
          </div>
          <a
            href={`tel:${(p.agent === "Artur Kokoszka" ? "505053335" : p.agent === "Iwona Gola" ? "515516177" : p.agent === "Paweł Wróblewski" ? "516206207" : "503751019")}`}
            className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
            aria-label="Zadzwoń"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
