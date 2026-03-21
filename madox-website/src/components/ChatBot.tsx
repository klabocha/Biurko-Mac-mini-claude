"use client";

import { useState, useRef, useEffect } from "react";
import { properties, companyInfo, team } from "@/data/properties";

interface Message {
  role: "bot" | "user";
  content: string;
  timestamp: Date;
}

const quickReplies = [
  "Szukam mieszkania na sprzedaż",
  "Szukam mieszkania na wynajem",
  "Ile kosztuje mieszkanie na Parkitce?",
  "Chcę sprzedać nieruchomość",
  "Kontakt z agentem",
];

function generateBotResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  // Greetings
  if (msg.match(/^(cześć|hej|dzień dobry|witam|siema|hello|hi)/)) {
    return `Dzień dobry! Jestem asystentem biura nieruchomości MADOX. W czym mogę pomóc?\n\nMogę pomóc w:\n- Wyszukiwaniu nieruchomości\n- Informacjach o cenach i dzielnicach\n- Kontakcie z agentem\n- Informacjach o kredytach`;
  }

  // Looking for apartments for sale
  if ((msg.includes("mieszkan") || msg.includes("apart")) && (msg.includes("sprzedaż") || msg.includes("kup") || msg.includes("sprzedaz"))) {
    const apartments = properties.filter((p) => p.type === "mieszkanie" && p.transaction === "sprzedaż");
    const cheapest = apartments.reduce((min, p) => (p.price < min.price ? p : min), apartments[0]);
    const expensive = apartments.reduce((max, p) => (p.price > max.price ? p : max), apartments[0]);

    return `Mamy ${apartments.length} mieszkań na sprzedaż!\n\n` +
      `Ceny: od ${cheapest.price.toLocaleString("pl-PL")} zł do ${expensive.price.toLocaleString("pl-PL")} zł\n` +
      `Powierzchnia: od ${Math.min(...apartments.map((a) => a.area))} m² do ${Math.max(...apartments.map((a) => a.area))} m²\n\n` +
      `Dzielnice: ${[...new Set(apartments.map((a) => a.district))].join(", ")}\n\n` +
      `Chcesz zawęzić wyszukiwanie? Podaj preferowaną dzielnicę, budżet lub liczbę pokoi.`;
  }

  // Looking for rentals
  if ((msg.includes("wynajem") || msg.includes("wynaj") || msg.includes("rent"))) {
    const rentals = properties.filter((p) => p.transaction === "wynajem");
    const cheapest = rentals.reduce((min, p) => (p.price < min.price ? p : min), rentals[0]);
    const expensive = rentals.reduce((max, p) => (p.price > max.price ? p : max), rentals[0]);

    return `Mamy ${rentals.length} ofert wynajmu!\n\n` +
      `Ceny: od ${cheapest.price.toLocaleString("pl-PL")} zł/mies. do ${expensive.price.toLocaleString("pl-PL")} zł/mies.\n\n` +
      `Lokalizacje: ${[...new Set(rentals.map((r) => r.district))].join(", ")}\n\n` +
      `Podaj preferowany budżet lub lokalizację, a pomogę znaleźć idealne mieszkanie!`;
  }

  // District-specific questions
  for (const district of ["parkitka", "grabówka", "centrum", "tysiąclecie", "północ", "dźbów", "wrzosowiak", "raków"]) {
    if (msg.includes(district)) {
      const districtName = district.charAt(0).toUpperCase() + district.slice(1);
      const inDistrict = properties.filter((p) => p.district.toLowerCase() === district);
      const sales = inDistrict.filter((p) => p.transaction === "sprzedaż");

      if (inDistrict.length === 0) {
        return `Aktualnie nie mamy ofert w dzielnicy ${districtName}, ale nowe oferty pojawiają się regularnie. Zostawić kontakt do agenta?`;
      }

      const avgPrice = sales.length > 0
        ? Math.round(sales.reduce((sum, p) => sum + p.pricePerM2, 0) / sales.length)
        : 0;

      return `W dzielnicy ${districtName} mamy ${inDistrict.length} ofert.\n\n` +
        (avgPrice > 0 ? `Średnia cena: ${avgPrice.toLocaleString("pl-PL")} zł/m²\n\n` : "") +
        inDistrict.slice(0, 3).map((p) =>
          `- ${p.title}: ${p.area} m², ${p.price.toLocaleString("pl-PL")} zł${p.transaction === "wynajem" ? "/mies." : ""}`
        ).join("\n");
    }
  }

  // Houses
  if (msg.includes("dom") || msg.includes("house")) {
    const houses = properties.filter((p) => p.type === "dom");
    return `Mamy ${houses.length} domów na sprzedaż!\n\n` +
      houses.slice(0, 3).map((h) =>
        `- ${h.location}: ${h.rooms} pok., ${h.area} m², ${h.price.toLocaleString("pl-PL")} zł`
      ).join("\n") +
      `\n\nChcesz poznać więcej szczegółów?`;
  }

  // Selling property
  if (msg.includes("sprzeda") && (msg.includes("chcę") || msg.includes("chce") || msg.includes("moj") || msg.includes("swoj"))) {
    return `Chętnie pomożemy w sprzedaży nieruchomości!\n\n` +
      `Oferujemy:\n` +
      `- Bezpłatną wycenę nieruchomości\n` +
      `- Profesjonalne zdjęcia i opis\n` +
      `- Prezentację na wiodących portalach\n` +
      `- 20 lat doświadczenia na rynku\n\n` +
      `Zadzwoń: ${companyInfo.phones[0]} (${team[0].name}) lub zostaw swoje dane w formularzu kontaktowym.`;
  }

  // Contact
  if (msg.includes("kontakt") || msg.includes("agent") || msg.includes("telefon") || msg.includes("zadzwon") || msg.includes("dzwon")) {
    return `Nasi agenci:\n\n` +
      team.map((t) => `- ${t.name} (${t.position}): ${t.phone}`).join("\n") +
      `\n\nBiuro: ${companyInfo.address}\nGodziny: ${companyInfo.hours}\nEmail: ${companyInfo.email}`;
  }

  // Price / cost
  if (msg.includes("cen") || msg.includes("kosztu") || msg.includes("ile")) {
    const sales = properties.filter((p) => p.transaction === "sprzedaż" && p.type === "mieszkanie");
    const avgPrice = Math.round(sales.reduce((sum, p) => sum + p.pricePerM2, 0) / sales.length);
    return `Średnia cena mieszkań w naszej ofercie: ${avgPrice.toLocaleString("pl-PL")} zł/m²\n\n` +
      `Zakres cen:\n` +
      `- Mieszkania: ${Math.min(...sales.map((s) => s.price)).toLocaleString("pl-PL")} - ${Math.max(...sales.map((s) => s.price)).toLocaleString("pl-PL")} zł\n` +
      `\nPodaj dzielnicę lub budżet, aby zawęzić wyniki.`;
  }

  // Credit / mortgage
  if (msg.includes("kredyt") || msg.includes("hipote") || msg.includes("rata")) {
    return `Pomagamy w uzyskaniu kredytu hipotecznego!\n\n` +
      `Na naszej stronie znajdziesz kalkulator kredytowy — sprawdź orientacyjną ratę.\n\n` +
      `Współpracujemy z doradcami kredytowymi, którzy pomogą wybrać najlepszą ofertę bankową. Zadzwoń: ${companyInfo.phones[0]}`;
  }

  // Default
  return `Dziękuję za wiadomość! Mogę pomóc w:\n\n` +
    `- Wyszukiwaniu mieszkań, domów, działek\n` +
    `- Informacjach o cenach w dzielnicach\n` +
    `- Kontakcie z agentem\n` +
    `- Sprzedaży Twojej nieruchomości\n` +
    `- Informacjach o kredytach\n\n` +
    `Zapytaj o cokolwiek lub zadzwoń: ${companyInfo.phones[0]}`;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: `Cześć! Jestem asystentem MADOX Nieruchomości. 🏠\n\nW czym mogę Ci pomóc? Mogę wyszukać oferty, podać ceny w dzielnicach lub połączyć z agentem.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateBotResponse(text);
      setMessages((prev) => [...prev, { role: "bot", content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 ${
          isOpen ? "bg-gray-700 rotate-0" : "bg-accent animate-pulse-glow"
        }`}
        aria-label="Otwórz czat"
      >
        {isOpen ? (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Notification badge */}
      {!isOpen && (
        <div className="fixed bottom-[88px] right-6 z-50 bg-white rounded-2xl shadow-xl p-4 max-w-[280px] chatbot-enter">
          <p className="text-sm text-gray-700">Szukasz nieruchomości? Mogę pomóc!</p>
          <button
            onClick={() => setIsOpen(true)}
            className="text-accent text-sm font-semibold mt-1 hover:underline"
          >
            Rozpocznij czat
          </button>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col chatbot-enter overflow-hidden" style={{ height: "min(600px, calc(100vh - 140px))" }}>
          {/* Header */}
          <div className="bg-primary p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <div className="text-white font-bold">MADOX Asystent</div>
              <div className="text-white/60 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Online 24/7
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-accent text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-gray-100 bg-white">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Napisz wiadomość..."
                className="flex-1 p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-3 bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
