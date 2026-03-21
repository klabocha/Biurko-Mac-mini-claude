import Link from "next/link";
import { companyInfo } from "@/data/properties";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white relative overflow-hidden">
      {/* Decorative top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                <span className="text-white font-black text-lg">M</span>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight">MADOX</span>
                <span className="block text-[9px] uppercase tracking-[0.25em] text-white/30 -mt-0.5">Nieruchomości</span>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-4">{companyInfo.tagline}</p>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-accent text-sm uppercase tracking-wider">Oferty</h4>
            <ul className="space-y-3 text-sm text-white/40">
              {["Mieszkania na sprzedaż", "Domy na sprzedaż", "Działki", "Lokale użytkowe", "Wynajem"].map((item) => (
                <li key={item}>
                  <Link href="/#oferty" className="hover:text-accent transition-colors duration-300">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-accent text-sm uppercase tracking-wider">Usługi</h4>
            <ul className="space-y-3 text-sm text-white/40">
              {["Kalkulator kredytowy", "Wycena nieruchomości", "Skup mieszkań", "Doradztwo kredytowe"].map((item) => (
                <li key={item}>
                  <Link href="/#kontakt" className="hover:text-accent transition-colors duration-300">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-accent text-sm uppercase tracking-wider">Kontakt</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 text-accent/60 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {companyInfo.address}
              </li>
              <li>
                <a href={`tel:${companyInfo.phones[0].replace(/-/g, "")}`} className="flex items-center gap-2.5 hover:text-accent transition-colors">
                  <svg className="w-4 h-4 text-accent/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {companyInfo.phones[0]}
                </a>
              </li>
              <li>
                <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-2.5 hover:text-accent transition-colors">
                  <svg className="w-4 h-4 text-accent/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {companyInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-accent/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {companyInfo.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/20 text-xs">&copy; 2024 {companyInfo.name}. Wszelkie prawa zastrzeżone.</p>
          <div className="flex gap-6 text-xs text-white/20">
            <Link href="/#" className="hover:text-accent transition-colors">Polityka prywatności</Link>
            <Link href="/#" className="hover:text-accent transition-colors">RODO</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
