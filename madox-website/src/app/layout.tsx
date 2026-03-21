import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "MADOX Nieruchomości Częstochowa | Mieszkania, Domy, Działki",
  description:
    "Biuro nieruchomości MADOX w Częstochowie. 20 lat doświadczenia. Sprzedaż i wynajem mieszkań, domów, działek. Profesjonalna obsługa i pełne wsparcie.",
  keywords: "nieruchomości, Częstochowa, mieszkania, domy, działki, sprzedaż, wynajem, MADOX",
  openGraph: {
    title: "MADOX Nieruchomości Częstochowa",
    description: "20 lat doświadczenia. Z nami bezpiecznie do własnego domu.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatBot />
      </body>
    </html>
  );
}
