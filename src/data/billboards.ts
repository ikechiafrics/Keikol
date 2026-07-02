import locLagos from "@/assets/loc-lagos.jpg";
import locAbuja from "@/assets/loc-abuja.jpg";
import locPh from "@/assets/loc-ph.jpg";
import locKano from "@/assets/loc-kano.jpg";
import heroImg from "@/assets/hero-billboard.jpg";
import campRealEstate from "@/assets/camp-realestate.jpg";
import campRestaurant from "@/assets/camp-restaurant.jpg";
import campTelecom from "@/assets/camp-telecom.jpg";

export type Availability = "Available" | "Coming Soon" | "Available Soon";
export type BillboardType = "Digital Billboard" | "Static Billboard" | "Premium Static Billboard";

export interface Billboard {
  id: string;
  city: string;
  area: string;
  landmark: string;
  lat: number;
  lng: number;
  billboardType: BillboardType;
  size: string;
  estimatedDailyImpressions: string;
  availability: Availability;
  priceRange: string;
  priceTier: string;
  lighting: string;
  description: string;
  recommendedIndustries: string[];
  bestFor: string[];
  nearbyLandmarks: string[];
  image: string;
  gallery: string[];
  bookedDates: string[];
  tags: string[];
}

export const BILLBOARDS: Billboard[] = [
  {
    id: "lagos-lekki-expressway",
    city: "Lagos",
    area: "Lekki Expressway",
    landmark: "Lekki Toll Gate corridor",
    lat: 6.4432,
    lng: 3.4725,
    billboardType: "Digital Billboard",
    size: "48ft x 14ft",
    estimatedDailyImpressions: "120,000+",
    availability: "Available",
    priceRange: "Contact for pricing",
    priceTier: "Premium",
    lighting: "Digital display / 24-hour visibility",
    description:
      "This premium billboard location gives brands strong visibility along one of Lagos' most active commercial and commuter corridors. It is ideal for businesses that want to reach professionals, residents, shoppers, and daily commuters.",
    recommendedIndustries: ["Real Estate", "Banking", "Telecom", "Restaurants", "FMCG", "Fashion"],
    bestFor: ["Product launches", "Premium brand awareness", "Real estate campaigns", "High-visibility consumer campaigns"],
    nearbyLandmarks: ["Commercial roads", "Shopping areas", "Residential traffic", "Restaurants", "Commuter routes", "Lifestyle districts"],
    image: locLagos,
    gallery: [locLagos],
    bookedDates: ["2026-07-06", "2026-07-07", "2026-07-15", "2026-07-23"],
    tags: ["Lagos", "Digital", "Available", "Premium Visibility", "High Traffic"],
  },
  {
    id: "abuja-central-business-district",
    city: "Abuja",
    area: "Central Business District",
    landmark: "CBD business corridor",
    lat: 9.0579,
    lng: 7.4951,
    billboardType: "Static Billboard",
    size: "40ft x 12ft",
    estimatedDailyImpressions: "85,000+",
    availability: "Available",
    priceRange: "Contact for pricing",
    priceTier: "Standard",
    lighting: "Illuminated",
    description:
      "This location is positioned for visibility in Abuja's business environment, making it suitable for brands that want credibility, corporate presence, and professional audience reach.",
    recommendedIndustries: ["Finance", "Government Campaigns", "Technology", "Real Estate", "Events"],
    bestFor: ["Corporate campaigns", "Public awareness", "Financial services", "Premium brand positioning"],
    nearbyLandmarks: ["Offices", "Government areas", "Business districts", "Commuter routes", "Commercial roads"],
    image: locAbuja,
    gallery: [locAbuja],
    bookedDates: ["2026-07-02", "2026-07-10", "2026-07-11", "2026-07-28"],
    tags: ["Abuja", "Static", "Available", "Corporate Visibility", "Business District"],
  },
  {
    id: "port-harcourt-aba-road",
    city: "Port Harcourt",
    area: "Aba Road",
    landmark: "High-traffic commercial road",
    lat: 4.8156,
    lng: 7.0498,
    billboardType: "Digital Billboard",
    size: "48ft x 14ft",
    estimatedDailyImpressions: "70,000+",
    availability: "Coming Soon",
    priceRange: "Contact for pricing",
    priceTier: "Standard",
    lighting: "Digital display",
    description:
      "This billboard placement is designed for visibility along one of Port Harcourt's active commercial routes, helping brands reach commuters, shoppers, and local businesses.",
    recommendedIndustries: ["FMCG", "Telecom", "Restaurants", "Events", "Education"],
    bestFor: ["Retail promotions", "Local awareness", "Food campaigns", "Education campaigns", "Consumer brand visibility"],
    nearbyLandmarks: ["Commercial roads", "Shopping areas", "Offices", "Restaurants", "Commuter routes"],
    image: locPh,
    gallery: [locPh],
    bookedDates: ["2026-07-09", "2026-07-18", "2026-07-19"],
    tags: ["Port Harcourt", "Digital", "Coming Soon", "Commercial Road", "Consumer Visibility"],
  },
  {
    id: "kano-commercial-district",
    city: "Kano",
    area: "Commercial District",
    landmark: "Major commercial corridor",
    lat: 12.0022,
    lng: 8.592,
    billboardType: "Static Billboard",
    size: "40ft x 12ft",
    estimatedDailyImpressions: "60,000+",
    availability: "Coming Soon",
    priceRange: "Contact for pricing",
    priceTier: "Standard",
    lighting: "Illuminated",
    description:
      "This billboard gives brands access to a busy commercial environment, making it suitable for businesses that want strong local visibility and repeated daily exposure.",
    recommendedIndustries: ["Retail", "FMCG", "Banking", "Education", "Events"],
    bestFor: ["Mass-market awareness", "Retail campaigns", "Product visibility", "Local business promotion"],
    nearbyLandmarks: ["Retail areas", "Commercial roads", "Markets", "Commuter routes", "Local business districts"],
    image: locKano,
    gallery: [locKano],
    bookedDates: ["2026-07-03", "2026-07-04", "2026-07-25"],
    tags: ["Kano", "Static", "Coming Soon", "Retail Visibility", "Commercial District"],
  },
  {
    id: "lagos-victoria-island",
    city: "Lagos",
    area: "Victoria Island",
    landmark: "Business and lifestyle district",
    lat: 6.4281,
    lng: 3.4219,
    billboardType: "Premium Static Billboard",
    size: "40ft x 12ft",
    estimatedDailyImpressions: "95,000+",
    availability: "Available",
    priceRange: "Contact for pricing",
    priceTier: "Elite",
    lighting: "Illuminated",
    description:
      "This location is ideal for premium brands seeking visibility in one of Lagos' major business and lifestyle districts. It is suited for campaigns that need credibility, elegance, and strong brand positioning.",
    recommendedIndustries: ["Luxury Brands", "Finance", "Real Estate", "Technology", "Hospitality"],
    bestFor: ["Premium campaigns", "Corporate branding", "Luxury visibility", "Hospitality and lifestyle promotion"],
    nearbyLandmarks: ["Offices", "Hotels", "Restaurants", "Lifestyle districts", "Business corridors", "Premium retail areas"],
    image: locLagos,
    gallery: [locLagos],
    bookedDates: ["2026-07-08", "2026-07-16", "2026-07-17", "2026-07-29"],
    tags: ["Lagos", "Premium Static", "Available", "Luxury Visibility", "Business District"],
  },
  {
    id: "abuja-airport-road",
    city: "Abuja",
    area: "Airport Road",
    landmark: "Airport route visibility",
    lat: 8.9963,
    lng: 7.2631,
    billboardType: "Digital Billboard",
    size: "48ft x 14ft",
    estimatedDailyImpressions: "90,000+",
    availability: "Available Soon",
    priceRange: "Contact for pricing",
    priceTier: "Premium",
    lighting: "Digital display",
    description:
      "This billboard placement is designed for high-value route visibility, reaching travelers, professionals, government traffic, and event audiences moving through Abuja's airport corridor.",
    recommendedIndustries: ["Travel", "Hospitality", "Telecom", "Government Campaigns", "Events"],
    bestFor: ["Travel campaigns", "Hospitality promotions", "National visibility", "Event campaigns", "Government/public messaging"],
    nearbyLandmarks: ["Airport route", "Hotels", "Commuter traffic", "Event traffic", "Government routes", "Business travelers"],
    image: locAbuja,
    gallery: [locAbuja],
    bookedDates: ["2026-07-12", "2026-07-13", "2026-07-20"],
    tags: ["Abuja", "Digital", "Available Soon", "Airport Route", "Travel Visibility"],
  },
];

export function getBillboardById(id: string): Billboard | undefined {
  return BILLBOARDS.find((b) => b.id === id);
}

export const CITIES = ["All", "Lagos", "Abuja", "Port Harcourt", "Kano"] as const;
export const BILLBOARD_TYPES = ["All", "Digital Billboard", "Static Billboard", "Premium Static Billboard"] as const;
export const AVAILABILITIES = ["All", "Available", "Coming Soon", "Available Soon"] as const;
export const INDUSTRY_FILTERS = [
  "All",
  "Real Estate",
  "Banking",
  "Telecom",
  "Restaurants",
  "FMCG",
  "Fashion",
  "Education",
  "Events",
  "Technology",
] as const;

export const PORTFOLIO_SAMPLES = [
  {
    img: campRealEstate,
    title: "Real Estate Launch",
    location: "Lagos",
    campaignType: "Billboard Awareness Campaign",
    category: "Real Estate",
    description:
      "A premium billboard campaign designed to promote a new property development to commuters, investors, and local buyers.",
  },
  {
    img: campRestaurant,
    title: "Restaurant Promotion",
    location: "Abuja",
    campaignType: "Local Visibility Campaign",
    category: "Restaurant",
    description:
      "A high-traffic outdoor campaign designed to drive awareness for a restaurant opening or seasonal menu promotion.",
  },
  {
    img: campTelecom,
    title: "Telecom Brand Push",
    location: "Port Harcourt",
    campaignType: "High-Reach Media Campaign",
    category: "Telecom",
    description:
      "A mass visibility campaign built for telecom offers, brand recall, and customer acquisition.",
  },
  {
    img: campRealEstate,
    title: "FMCG Product Launch",
    location: "Kano",
    campaignType: "Consumer Awareness Campaign",
    category: "FMCG",
    description:
      "A campaign designed to support product recognition and retail demand in busy commercial areas.",
  },
  {
    img: campRestaurant,
    title: "Fashion Collection Drop",
    location: "Victoria Island",
    campaignType: "Lifestyle Visibility Campaign",
    category: "Fashion",
    description:
      "A premium visual campaign for fashion brands looking to create aspiration and high-end brand presence.",
  },
  {
    img: campTelecom,
    title: "Education Admissions Campaign",
    location: "Abuja",
    campaignType: "Public Awareness Campaign",
    category: "Education",
    description:
      "A campaign concept for schools and training institutions promoting admissions or new programs.",
  },
];

export { heroImg };
