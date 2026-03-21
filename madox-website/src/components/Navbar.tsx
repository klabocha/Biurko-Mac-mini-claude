"use client";

import { useState } from "react";
import Link from "next/link";
import { companyInfo } from "@/data/properties";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-primary">MADOX</span>
              <span className="block text-xs text-gray-500 -mt-1 tracking-wider">NIERUCHOMOŚCI</span>
            </div>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#oferty" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Oferty
            </Link>
            <Link href="/#kalkulator" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Kalkulator
            </Link>
            <Link href="/#zespol" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Zespół
            </Link>
            <Link href="/#kontakt" className="text-gray-700 hover:text-primary font-medium transition-colors">
              Kontakt
            </Link>
            <a
              href={`tel:${companyInfo.phones[0].replace(/-/g, "")}`}
              className="bg-accent hover:bg-accent-dark text-white px-6 py-2.5 rounded-full font-semibold transition-all hover:shadow-lg"
            >
              {companyInfo.phones[0]}
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-6 border-t border-gray-200/50 pt-4">
            <div className="flex flex-col gap-4">
              <Link href="/#oferty" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium">Oferty</Link>
              <Link href="/#kalkulator" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium">Kalkulator</Link>
              <Link href="/#zespol" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium">Zespół</Link>
              <Link href="/#kontakt" onClick={() => setIsOpen(false)} className="text-gray-700 hover:text-primary font-medium">Kontakt</Link>
              <a
                href={`tel:${companyInfo.phones[0].replace(/-/g, "")}`}
                className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold text-center"
              >
                Zadzwoń: {companyInfo.phones[0]}
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
