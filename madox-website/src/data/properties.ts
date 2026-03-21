export type PropertyType = "mieszkanie" | "dom" | "działka" | "lokal" | "obiekt" | "hala";
export type TransactionType = "sprzedaż" | "wynajem";

export interface Property {
  id: string;
  type: PropertyType;
  transaction: TransactionType;
  title: string;
  location: string;
  district: string;
  rooms: number | null;
  area: number;
  price: number;
  pricePerM2: number;
  yearBuilt?: number;
  floor?: number;
  description: string;
  features: string[];
  images: string[];
  agent: string;
  isSpecial?: boolean;
  isNew?: boolean;
  hasVideo?: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface TeamMember {
  name: string;
  position: string;
  phone: string;
  email: string;
  offersCount: number;
  photo: string;
}

export const companyInfo = {
  name: "Kancelaria Obrotu Nieruchomościami MADOX",
  owner: "Artur Kokoszka",
  address: "ul. Racławicka 22 lok. 4, 42-200 Częstochowa",
  phones: ["505-053-335", "515-516-177", "503-751-019", "516-206-207"],
  email: "artur.kokoszka@madox.nieruchomosci.pl",
  hours: "Poniedziałek - Piątek: 9:00 - 17:00",
  experience: 20,
  tagline: "20 lat doświadczenia. Z nami bezpiecznie do własnego domu.",
};

export const team: TeamMember[] = [
  {
    name: "Artur Kokoszka",
    position: "Manager / Właściciel",
    phone: "505-053-335",
    email: "artur.kokoszka@madox.nieruchomosci.pl",
    offersCount: 44,
    photo: "/team/artur.jpg",
  },
  {
    name: "Iwona Gola",
    position: "Agent Nieruchomości",
    phone: "515-516-177",
    email: "iwona.gola@madox.nieruchomosci.pl",
    offersCount: 48,
    photo: "/team/iwona.jpg",
  },
  {
    name: "Patrycja Bednarek-Kokoszka",
    position: "Agent Nieruchomości",
    phone: "503-751-019",
    email: "patrycja.bednarek@madox.nieruchomosci.pl",
    offersCount: 0,
    photo: "/team/patrycja.jpg",
  },
  {
    name: "Paweł Wróblewski",
    position: "Agent Nieruchomości",
    phone: "516-206-207",
    email: "pawel.wroblewski@madox.nieruchomosci.pl",
    offersCount: 3,
    photo: "/team/pawel.jpg",
  },
];

// Częstochowa district coordinates for the map
const districtCoords: Record<string, { lat: number; lng: number }> = {
  "Grabówka": { lat: 50.7950, lng: 19.1350 },
  "Parkitka": { lat: 50.7880, lng: 19.1250 },
  "Tysiąclecie": { lat: 50.8050, lng: 19.1200 },
  "Północ": { lat: 50.8200, lng: 19.1100 },
  "Dźbów": { lat: 50.7700, lng: 19.0800 },
  "Centrum": { lat: 50.8118, lng: 19.1203 },
  "Stare Miasto": { lat: 50.8130, lng: 19.1180 },
  "Trzech Wieszczów": { lat: 50.8000, lng: 19.1050 },
  "Wrzosowiak": { lat: 50.7850, lng: 19.0950 },
  "Raków": { lat: 50.8300, lng: 19.1000 },
};

function getCoords(location: string): { lat: number; lng: number } {
  for (const [district, coords] of Object.entries(districtCoords)) {
    if (location.includes(district)) return coords;
  }
  // Default: Częstochowa center with slight random offset
  return {
    lat: 50.8118 + (Math.random() - 0.5) * 0.02,
    lng: 19.1203 + (Math.random() - 0.5) * 0.02,
  };
}

function getDistrict(location: string): string {
  const parts = location.split(", ");
  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
}

// Demo images for properties (Unsplash-style placeholders)
const apartmentImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
];

const houseImages = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",
];

const landImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&h=600&fit=crop",
];

const commercialImages = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
];

function getImages(type: PropertyType): string[] {
  switch (type) {
    case "mieszkanie": return apartmentImages;
    case "dom": return houseImages;
    case "działka": return landImages;
    default: return commercialImages;
  }
}

function generateDescription(p: { type: PropertyType; rooms: number | null; area: number; location: string }): string {
  const typeLabels: Record<PropertyType, string> = {
    mieszkanie: "Mieszkanie",
    dom: "Dom",
    działka: "Działka",
    lokal: "Lokal użytkowy",
    obiekt: "Obiekt komercyjny",
    hala: "Hala",
  };
  const label = typeLabels[p.type];
  const roomsText = p.rooms ? `${p.rooms}-pokojowe, ` : "";
  return `${label} ${roomsText}o powierzchni ${p.area} m² w lokalizacji ${p.location}. Doskonała lokalizacja z dostępem do komunikacji miejskiej, sklepów i szkół. Zapraszamy na prezentację!`;
}

function generateFeatures(type: PropertyType, rooms: number | null): string[] {
  const base = ["Dostęp do komunikacji", "Blisko sklepów"];
  if (type === "mieszkanie") {
    return [...base, "Balkon", rooms && rooms >= 3 ? "Oddzielna kuchnia" : "Aneks kuchenny", "Piwnica"];
  }
  if (type === "dom") {
    return [...base, "Ogród", "Garaż", "Taras", "Działka"];
  }
  if (type === "działka") {
    return ["Media w drodze", "Dojazd utwardzony", "Plan zagospodarowania"];
  }
  return [...base, "Klimatyzacja", "Parking"];
}

export const properties: Property[] = [
  // Mieszkania na sprzedaż
  { id: "MDX-MS-6413", type: "mieszkanie", transaction: "sprzedaż", title: "Mieszkanie na sprzedaż", location: "Częstochowa, Dźbów", district: "Dźbów", rooms: 2, area: 40, price: 259000, pricePerM2: 6475, description: "", features: [], images: [], agent: "Iwona Gola", isNew: true, coordinates: getCoords("Częstochowa, Dźbów") },
  { id: "MDX-MS-6412", type: "mieszkanie", transaction: "sprzedaż", title: "Mieszkanie na sprzedaż", location: "Częstochowa, Północ", district: "Północ", rooms: 2, area: 51, price: 299000, pricePerM2: 5862.75, description: "", features: [], images: [], agent: "Artur Kokoszka", isNew: true, hasVideo: true, coordinates: getCoords("Częstochowa, Północ") },
  { id: "MDX-MS-6411", type: "mieszkanie", transaction: "sprzedaż", title: "Mieszkanie na sprzedaż", location: "Częstochowa, Trzech Wieszczów", district: "Trzech Wieszczów", rooms: 3, area: 50.10, price: 260000, pricePerM2: 5189.62, description: "", features: [], images: [], agent: "Iwona Gola", coordinates: getCoords("Częstochowa, Trzech Wieszczów") },
  { id: "MDX-MS-6404", type: "mieszkanie", transaction: "sprzedaż", title: "Mieszkanie na sprzedaż", location: "Częstochowa, Tysiąclecie", district: "Tysiąclecie", rooms: 2, area: 50.61, price: 359000, pricePerM2: 7093.46, description: "", features: [], images: [], agent: "Artur Kokoszka", coordinates: getCoords("Częstochowa, Tysiąclecie") },
  { id: "MDX-MS-6395", type: "mieszkanie", transaction: "sprzedaż", title: "Mieszkanie na sprzedaż", location: "Częstochowa, Tysiąclecie", district: "Tysiąclecie", rooms: 2, area: 52.40, price: 364000, pricePerM2: 6946.56, description: "", features: [], images: [], agent: "Iwona Gola", isSpecial: true, hasVideo: true, coordinates: getCoords("Częstochowa, Tysiąclecie") },
  { id: "MDX-MS-6393", type: "mieszkanie", transaction: "sprzedaż", title: "Mieszkanie na sprzedaż", location: "Częstochowa, Centrum", district: "Centrum", rooms: 3, area: 46.90, price: 270000, pricePerM2: 5756.93, description: "", features: [], images: [], agent: "Artur Kokoszka", coordinates: getCoords("Częstochowa, Centrum") },
  { id: "MDX-MS-6389", type: "mieszkanie", transaction: "sprzedaż", title: "Mieszkanie na sprzedaż", location: "Częstochowa, Grabówka", district: "Grabówka", rooms: 4, area: 65.58, price: 531000, pricePerM2: 8096.98, description: "", features: [], images: [], agent: "Iwona Gola", coordinates: getCoords("Częstochowa, Grabówka") },
  { id: "MDX-MS-6388", type: "mieszkanie", transaction: "sprzedaż", title: "Mieszkanie na sprzedaż", location: "Częstochowa, Grabówka", district: "Grabówka", rooms: 4, area: 65.58, price: 531000, pricePerM2: 8096.98, description: "", features: [], images: [], agent: "Artur Kokoszka", isSpecial: true, coordinates: getCoords("Częstochowa, Grabówka") },
  { id: "MDX-MS-6376", type: "mieszkanie", transaction: "sprzedaż", title: "Mieszkanie na sprzedaż", location: "Częstochowa, Parkitka", district: "Parkitka", rooms: 3, area: 77.15, price: 745000, pricePerM2: 9656.51, description: "", features: [], images: [], agent: "Iwona Gola", isSpecial: true, coordinates: getCoords("Częstochowa, Parkitka") },
  // Domy na sprzedaż
  { id: "MDX-DS-6414", type: "dom", transaction: "sprzedaż", title: "Dom na sprzedaż", location: "Kamienica Polska", district: "Kamienica Polska", rooms: 2, area: 80, price: 299000, pricePerM2: 3737.50, description: "", features: [], images: [], agent: "Paweł Wróblewski", isNew: true, coordinates: { lat: 50.7400, lng: 19.1300 } },
  { id: "MDX-DS-6385", type: "dom", transaction: "sprzedaż", title: "Dom na sprzedaż", location: "Częstochowa, Grabówka", district: "Grabówka", rooms: 7, area: 225, price: 649000, pricePerM2: 2884.44, description: "", features: [], images: [], agent: "Artur Kokoszka", coordinates: getCoords("Częstochowa, Grabówka") },
  { id: "MDX-DS-6377", type: "dom", transaction: "sprzedaż", title: "Dom na sprzedaż", location: "Częstochowa, Tysiąclecie", district: "Tysiąclecie", rooms: 6, area: 290.27, price: 799000, pricePerM2: 2752.61, description: "", features: [], images: [], agent: "Iwona Gola", coordinates: getCoords("Częstochowa, Tysiąclecie") },
  { id: "MDX-DS-6362", type: "dom", transaction: "sprzedaż", title: "Dom na sprzedaż", location: "Częstochowa, Dźbów", district: "Dźbów", rooms: 4, area: 261.70, price: 799000, pricePerM2: 3053.11, description: "", features: [], images: [], agent: "Artur Kokoszka", coordinates: getCoords("Częstochowa, Dźbów") },
  { id: "MDX-DS-6344", type: "dom", transaction: "sprzedaż", title: "Dom na sprzedaż", location: "Mykanów, Czarny Las", district: "Czarny Las", rooms: 5, area: 212.71, price: 399000, pricePerM2: 1875.79, description: "", features: [], images: [], agent: "Iwona Gola", coordinates: { lat: 50.7600, lng: 19.2000 } },
  { id: "MDX-DS-6343", type: "dom", transaction: "sprzedaż", title: "Dom na sprzedaż", location: "Częstochowa, Tysiąclecie", district: "Tysiąclecie", rooms: 4, area: 250, price: 2300000, pricePerM2: 9200, description: "", features: [], images: [], agent: "Artur Kokoszka", isSpecial: true, coordinates: getCoords("Częstochowa, Tysiąclecie") },
  { id: "MDX-DS-6338", type: "dom", transaction: "sprzedaż", title: "Dom na sprzedaż", location: "Olsztyn", district: "Olsztyn", rooms: 9, area: 362, price: 1499000, pricePerM2: 4140.88, description: "", features: [], images: [], agent: "Iwona Gola", coordinates: { lat: 50.7500, lng: 19.2700 } },
  { id: "MDX-DS-6286", type: "dom", transaction: "sprzedaż", title: "Dom na sprzedaż", location: "Częstochowa, Grabówka", district: "Grabówka", rooms: 4, area: 118.50, price: 870000, pricePerM2: 7341.77, description: "", features: [], images: [], agent: "Artur Kokoszka", isSpecial: true, coordinates: getCoords("Częstochowa, Grabówka") },
  // Działki
  { id: "MDX-GS-6410", type: "działka", transaction: "sprzedaż", title: "Działka na sprzedaż", location: "Olsztyn, Bukowno", district: "Bukowno", rooms: null, area: 1227, price: 159000, pricePerM2: 129.58, description: "", features: [], images: [], agent: "Paweł Wróblewski", isNew: true, coordinates: { lat: 50.7450, lng: 19.2800 } },
  // Obiekty / Lokale komercyjne
  { id: "MDX-BS-6403", type: "obiekt", transaction: "sprzedaż", title: "Obiekt na sprzedaż", location: "Częstochowa, Stare Miasto", district: "Stare Miasto", rooms: null, area: 238.50, price: 1780000, pricePerM2: 7463.31, description: "", features: [], images: [], agent: "Artur Kokoszka", isSpecial: true, hasVideo: true, coordinates: getCoords("Częstochowa, Stare Miasto") },
  { id: "MDX-LS-6407", type: "lokal", transaction: "sprzedaż", title: "Lokal na sprzedaż", location: "Częstochowa, Stare Miasto", district: "Stare Miasto", rooms: null, area: 238.50, price: 1780000, pricePerM2: 7463.31, description: "", features: [], images: [], agent: "Artur Kokoszka", isSpecial: true, hasVideo: true, coordinates: getCoords("Częstochowa, Stare Miasto") },
  // Mieszkania na wynajem
  { id: "MDX-MW-6408", type: "mieszkanie", transaction: "wynajem", title: "Mieszkanie na wynajem", location: "Częstochowa, Grabówka", district: "Grabówka", rooms: 2, area: 44, price: 1850, pricePerM2: 42.05, description: "", features: [], images: [], agent: "Iwona Gola", isNew: true, coordinates: getCoords("Częstochowa, Grabówka") },
  { id: "MDX-MW-6406", type: "mieszkanie", transaction: "wynajem", title: "Mieszkanie na wynajem", location: "Częstochowa, Wrzosowiak", district: "Wrzosowiak", rooms: 1, area: 36, price: 1300, pricePerM2: 36.11, description: "", features: [], images: [], agent: "Iwona Gola", coordinates: getCoords("Częstochowa, Wrzosowiak") },
  { id: "MDX-MW-6402", type: "mieszkanie", transaction: "wynajem", title: "Mieszkanie na wynajem", location: "Częstochowa, Parkitka", district: "Parkitka", rooms: 2, area: 42, price: 2300, pricePerM2: 54.76, description: "", features: [], images: [], agent: "Artur Kokoszka", coordinates: getCoords("Częstochowa, Parkitka") },
  { id: "MDX-MW-6401", type: "mieszkanie", transaction: "wynajem", title: "Mieszkanie na wynajem", location: "Częstochowa, Raków", district: "Raków", rooms: 2, area: 36, price: 1500, pricePerM2: 41.67, description: "", features: [], images: [], agent: "Iwona Gola", coordinates: getCoords("Częstochowa, Raków") },
  { id: "MDX-MW-6400", type: "mieszkanie", transaction: "wynajem", title: "Mieszkanie na wynajem", location: "Częstochowa, Centrum", district: "Centrum", rooms: 1, area: 30, price: 1000, pricePerM2: 33.33, description: "", features: [], images: [], agent: "Artur Kokoszka", coordinates: getCoords("Częstochowa, Centrum") },
  { id: "MDX-MW-6390", type: "mieszkanie", transaction: "wynajem", title: "Mieszkanie na wynajem", location: "Częstochowa, Centrum", district: "Centrum", rooms: 2, area: 61, price: 1000, pricePerM2: 16.39, description: "", features: [], images: [], agent: "Iwona Gola", coordinates: getCoords("Częstochowa, Centrum") },
  { id: "MDX-MW-6383", type: "mieszkanie", transaction: "wynajem", title: "Mieszkanie na wynajem", location: "Częstochowa, Parkitka", district: "Parkitka", rooms: 3, area: 70, price: 2800, pricePerM2: 40, description: "", features: [], images: [], agent: "Artur Kokoszka", coordinates: getCoords("Częstochowa, Parkitka") },
  { id: "MDX-MW-6208", type: "mieszkanie", transaction: "wynajem", title: "Mieszkanie na wynajem", location: "Częstochowa, Centrum", district: "Centrum", rooms: 2, area: 60, price: 3000, pricePerM2: 50, description: "", features: [], images: [], agent: "Iwona Gola", coordinates: getCoords("Częstochowa, Centrum") },
];

// Fill in auto-generated fields
properties.forEach((p) => {
  if (!p.description) p.description = generateDescription(p);
  if (p.features.length === 0) p.features = generateFeatures(p.type, p.rooms);
  if (p.images.length === 0) p.images = getImages(p.type);
});
