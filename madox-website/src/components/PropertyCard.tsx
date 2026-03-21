"use client";

import Image from "next/image";
import { type Property } from "@/data/properties";

function formatPrice(price: number, transaction: string): string {
  if (transaction === "wynajem") {
    return `${price.toLocaleString("pl-PL")} zł/mies.`;
  }
  return `${price.toLocaleString("pl-PL")} zł`;
}

const typeIcons: Record<string, string> = {
  mieszkanie: "🏢",
  dom: "🏠",
  działka: "🌳",
  lokal: "🏪",
  obiekt: "🏗️",
  hala: "🏭",
};

export default function PropertyCard({ property }: { property: Property }) {
  const p = property;

  return (
    <div className="property-card bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 group">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={p.images[0]}
          alt={p.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {p.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              NOWA
            </span>
          )}
          {p.isSpecial && (
            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
              SPECJALNA
            </span>
          )}
          {p.hasVideo && (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              VIDEO
            </span>
          )}
        </div>
        {/* Transaction badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${
            p.transaction === "sprzedaż" ? "bg-primary" : "bg-blue-500"
          }`}>
            {p.transaction === "sprzedaż" ? "SPRZEDAŻ" : "WYNAJEM"}
          </span>
        </div>
        {/* Price overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
          <div className="text-white font-bold text-xl">{formatPrice(p.price, p.transaction)}</div>
          {p.transaction === "sprzedaż" && (
            <div className="text-white/70 text-sm">{p.pricePerM2.toLocaleString("pl-PL")} zł/m²</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{typeIcons[p.type] || "🏠"}</span>
          <h3 className="font-bold text-gray-800">{p.title}</h3>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {p.location}
        </div>

        {/* Features row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
          {p.rooms && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{p.rooms} {p.rooms === 1 ? "pokój" : p.rooms < 5 ? "pokoje" : "pokoi"}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>{p.area} m²</span>
          </div>
          <div className="ml-auto text-xs text-gray-400">{p.id}</div>
        </div>

        {/* Agent */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
            {p.agent.split(" ").map((n) => n[0]).join("")}
          </div>
          <span className="text-xs text-gray-500">{p.agent}</span>
          <a
            href={`tel:${(p.agent === "Artur Kokoszka" ? "505053335" : p.agent === "Iwona Gola" ? "515516177" : p.agent === "Paweł Wróblewski" ? "516206207" : "503751019")}`}
            className="ml-auto text-accent hover:text-accent-dark transition-colors"
            aria-label="Zadzwoń"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
