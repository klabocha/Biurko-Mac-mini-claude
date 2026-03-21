"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { companyInfo } from "@/data/properties";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "glass shadow-lg shadow-black/5 py-2"
        : "bg-transparent py-4"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
              scrolled
                ? "bg-primary shadow-md"
                : "bg-white/10 backdrop-blur-sm border border-white/20"
            }`}>
              <span className="text-white font-black text-xl">M</span>
            </div>
            <div>
              <span className={`text-xl font-black tracking-tight transition-colors ${scrolled ? "text-primary" : "text-white"}`}>
                MADOX
              </span>
              <span className={`block text-[9px] uppercase tracking-[0.25em] -mt-0.5 transition-colors ${scrolled ? "text-gray-400" : "text-white/50"}`}>
                Nieruchomości
              </span>
            </div>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: "/#oferty", label: "Oferty" },
              { href: "/#kalkulator", label: "Kalkulator" },
              { href: "/#zespol", label: "Zespół" },
              { href: "/#kontakt", label: "Kontakt" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  scrolled
                    ? "text-gray-600 hover:text-primary hover:bg-gray-100"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`tel:${companyInfo.phones[0].replace(/-/g, "")}`}
              className="ml-3 btn-premium bg-gradient-to-r from-accent to-accent-dark text-white px-6 py-2.5 rounded-full text-sm font-bold"
            >
              {companyInfo.phones[0]}
            </a>
          </div>

          {/* Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? "text-gray-700" : "text-white"}`}
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

        {isOpen && (
          <div className="md:hidden mt-4 glass rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col gap-1">
              {["Oferty", "Kalkulator", "Zespół", "Kontakt"].map((label) => (
                <Link
                  key={label}
                  href={`/#${label.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 hover:text-primary hover:bg-gray-50 px-4 py-3 rounded-xl font-medium transition-colors"
                >
                  {label}
                </Link>
              ))}
              <a
                href={`tel:${companyInfo.phones[0].replace(/-/g, "")}`}
                className="mt-2 btn-premium bg-gradient-to-r from-accent to-accent-dark text-white px-6 py-3 rounded-xl font-bold text-center"
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
