import Link from "next/link";
import { companyInfo } from "@/data/properties";

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <span className="text-xl font-bold">MADOX</span>
                <span className="block text-xs text-white/50 -mt-0.5">NIERUCHOMOŚCI</span>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-4">{companyInfo.tagline}</p>
            <p className="text-white/40 text-xs">{companyInfo.name}</p>
          </div>

          {/* Oferty */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Oferty</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/#oferty" className="hover:text-white transition-colors">Mieszkania na sprzedaż</Link></li>
              <li><Link href="/#oferty" className="hover:text-white transition-colors">Domy na sprzedaż</Link></li>
              <li><Link href="/#oferty" className="hover:text-white transition-colors">Działki</Link></li>
              <li><Link href="/#oferty" className="hover:text-white transition-colors">Lokale użytkowe</Link></li>
              <li><Link href="/#oferty" className="hover:text-white transition-colors">Mieszkania na wynajem</Link></li>
            </ul>
          </div>

          {/* Usługi */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Usługi</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/#kalkulator" className="hover:text-white transition-colors">Kalkulator kredytowy</Link></li>
              <li><Link href="/#kontakt" className="hover:text-white transition-colors">Wycena nieruchomości</Link></li>
              <li><Link href="/#kontakt" className="hover:text-white transition-colors">Skup mieszkań</Link></li>
              <li><Link href="/#kontakt" className="hover:text-white transition-colors">Doradztwo kredytowe</Link></li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Kontakt</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {companyInfo.address}
              </li>
              <li>
                <a href={`tel:${companyInfo.phones[0].replace(/-/g, "")}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {companyInfo.phones[0]}
                </a>
              </li>
              <li>
                <a href={`mailto:${companyInfo.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {companyInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {companyInfo.hours}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            &copy; 2024 {companyInfo.name}. Wszelkie prawa zastrzeżone.
          </p>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/#" className="hover:text-white transition-colors">Polityka prywatności</Link>
            <Link href="/#" className="hover:text-white transition-colors">RODO</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
