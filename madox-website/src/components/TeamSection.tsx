"use client";

import { team, companyInfo } from "@/data/properties";

export default function TeamSection() {
  return (
    <section id="zespol" className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Nasz <span className="text-accent">zespół</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Profesjonalni agenci z wieloletnim doświadczeniem. Pomożemy Ci na każdym etapie transakcji.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-2 border border-gray-100"
            >
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>

              <h3 className="text-lg font-bold text-gray-800">{member.name}</h3>
              <p className="text-accent font-medium text-sm mb-4">{member.position}</p>

              {member.offersCount > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {member.offersCount} ofert
                </div>
              )}

              <div className="space-y-2">
                <a
                  href={`tel:${member.phone.replace(/-/g, "")}`}
                  className="flex items-center justify-center gap-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm font-medium">{member.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Company info banner */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-md border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Adres</div>
                <div className="font-medium text-gray-800">{companyInfo.address}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Godziny otwarcia</div>
                <div className="font-medium text-gray-800">{companyInfo.hours}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium text-gray-800">{companyInfo.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
