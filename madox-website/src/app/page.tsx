import Hero from "@/components/Hero";
import PropertyListings from "@/components/PropertyListings";
import MapSection from "@/components/MapSection";
import MortgageCalculator from "@/components/MortgageCalculator";
import ValuationBanner from "@/components/ValuationBanner";
import TeamSection from "@/components/TeamSection";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <>
      <Hero />
      <PropertyListings />
      <MapSection />
      <MortgageCalculator />
      <ValuationBanner />
      <TeamSection />
      <ContactForm />
    </>
  );
}
