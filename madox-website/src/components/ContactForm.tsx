"use client";

import { useState } from "react";
import { companyInfo } from "@/data/properties";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Kupno nieruchomości",
    message: "",
    consent: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="kontakt" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left - Info */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Skontaktuj się <span className="text-accent">z nami</span>
            </h2>
            <p className="text-gray-600 mb-8">
              Masz pytania? Chcesz sprzedać lub kupić nieruchomość? Wypełnij formularz lub zadzwoń — odpowiemy w ciągu 24 godzin.
            </p>

            {/* Quick contact cards */}
            <div className="space-y-4 mb-8">
              <a
                href={`tel:${companyInfo.phones[0].replace(/-/g, "")}`}
                className="flex items-center gap-4 p-4 bg-surface rounded-xl hover:bg-accent/5 transition-colors group"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Telefon główny</div>
                  <div className="font-bold text-gray-800 text-lg">{companyInfo.phones[0]}</div>
                </div>
              </a>

              <a
                href={`mailto:${companyInfo.email}`}
                className="flex items-center gap-4 p-4 bg-surface rounded-xl hover:bg-primary/5 transition-colors group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-bold text-gray-800">{companyInfo.email}</div>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 bg-surface rounded-xl">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Biuro</div>
                  <div className="font-bold text-gray-800">{companyInfo.address}</div>
                </div>
              </div>
            </div>

            {/* Selling CTA */}
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-6 border border-accent/20">
              <h3 className="font-bold text-gray-800 mb-2">Chcesz sprzedać nieruchomość?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Bezpłatna wycena nieruchomości. 20 lat doświadczenia na rynku częstochowskim.
              </p>
              <a
                href={`tel:${companyInfo.phones[0].replace(/-/g, "")}`}
                className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-accent-dark transition-all"
              >
                Zadzwoń teraz
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right - Form */}
          <div>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Wiadomość wysłana!</h3>
                <p className="text-green-600">Skontaktujemy się z Tobą w ciągu 24 godzin.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-8 shadow-sm">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Imię i nazwisko *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all bg-white"
                      placeholder="Jan Kowalski"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all bg-white"
                        placeholder="jan@email.pl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all bg-white"
                        placeholder="500 000 000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Temat</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all bg-white"
                    >
                      <option>Kupno nieruchomości</option>
                      <option>Sprzedaż nieruchomości</option>
                      <option>Wynajem</option>
                      <option>Wycena nieruchomości</option>
                      <option>Kredyt hipoteczny</option>
                      <option>Inne</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Wiadomość *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent transition-all bg-white resize-none"
                      placeholder="Opisz czego szukasz lub w czym możemy Ci pomóc..."
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.consent}
                      onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-1 accent-accent"
                    />
                    <span className="text-xs text-gray-500">
                      Wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji zapytania zgodnie z polityką prywatności (RODO). *
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Wyślij wiadomość
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
