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
  billboardType: BillboardType;
  size: string;
  estimatedDailyImpressions: string;
  availability: Availability;
  priceRange: string;
  lighting: string;
  description: string;
  nearbyBusinesses: string[];
  recommendedIndustries: string[];
  image: string;
  tags: string[];
}

export const BILLBOARDS: Billboard[] = [
  {
    id: "lagos-lekki-expressway",
    city: "Lagos",
    area: "Lekki Expressway",
    landmark: "Lekki Toll Gate corridor",
    billboardType: "Digital Billboard",
    size: "48ft x 14ft",
    estimatedDailyImpressions: "120,000+",
    availability: "Available",
    priceRange: "Contact for pricing",
    lighting: "Digital display / 24-hour visibility",
    description:
      "A flagship digital placement along one of Lagos' busiest commercial corridors. Designed for high-frequency brand exposure to commuters, professionals, and shoppers.",
    nearbyBusinesses: ["Shopping malls", "Corporate offices", "Restaurants", "Luxury residential"],
    recommendedIndustries: ["Real Estate", "Banking", "Telecom", "Restaurants", "FMCG", "Fashion"],
    image: locLagos,
    tags: ["High Traffic", "Digital", "Premium"],
  },
  {
    id: "abuja-cbd",
    city: "Abuja",
    area: "Central Business District",
    landmark: "CBD business corridor",
    billboardType: "Static Billboard",
    size: "40ft x 12ft",
    estimatedDailyImpressions: "85,000+",
    availability: "Available",
    priceRange: "Contact for pricing",
    lighting: "Illuminated",
    description:
      "Positioned in Abuja's professional core, ideal for finance, government-facing and corporate campaigns seeking credibility and reach.",
    nearbyBusinesses: ["Government offices", "Banks", "Hotels", "Conference centres"],
    recommendedIndustries: ["Banking", "Government Campaigns", "Technology", "Real Estate", "Events"],
    image: locAbuja,
    tags: ["Corporate", "Illuminated", "Capital"],
  },
  {
    id: "port-harcourt-aba-road",
    city: "Port Harcourt",
    area: "Aba Road",
    landmark: "High-traffic commercial road",
    billboardType: "Digital Billboard",
    size: "48ft x 14ft",
    estimatedDailyImpressions: "70,000+",
    availability: "Coming Soon",
    priceRange: "Contact for pricing",
    lighting: "Digital display",
    description:
      "An upcoming digital site on one of Port Harcourt's busiest commercial routes. Built for high-impact awareness and product campaigns.",
    nearbyBusinesses: ["Retail outlets", "Restaurants", "Office complexes", "Markets"],
    recommendedIndustries: ["FMCG", "Telecom", "Restaurants", "Events", "Education"],
    image: locPh,
    tags: ["Digital", "Commercial"],
  },
  {
    id: "kano-commercial-district",
    city: "Kano",
    area: "Commercial District",
    landmark: "Major commercial corridor",
    billboardType: "Static Billboard",
    size: "40ft x 12ft",
    estimatedDailyImpressions: "60,000+",
    availability: "Coming Soon",
    priceRange: "Contact for pricing",
    lighting: "Illuminated",
    description:
      "A strategic static placement in Kano's trade-heavy commercial district, ideal for retail, FMCG, and consumer-facing campaigns.",
    nearbyBusinesses: ["Markets", "Retail", "Wholesale outlets", "Banks"],
    recommendedIndustries: ["Retail", "FMCG", "Banking", "Education", "Events"],
    image: locKano,
    tags: ["Static", "Commerce"],
  },
  {
    id: "lagos-victoria-island",
    city: "Lagos",
    area: "Victoria Island",
    landmark: "Business and lifestyle district",
    billboardType: "Premium Static Billboard",
    size: "40ft x 12ft",
    estimatedDailyImpressions: "95,000+",
    availability: "Available",
    priceRange: "Contact for pricing",
    lighting: "Illuminated",
    description:
      "A premium illuminated placement in Lagos' lifestyle and business hub. Perfect for luxury, finance, and hospitality brands.",
    nearbyBusinesses: ["Luxury hotels", "Banks", "Fine dining", "Corporate headquarters"],
    recommendedIndustries: ["Luxury Brands", "Banking", "Real Estate", "Technology", "Hospitality"],
    image: locLagos,
    tags: ["Premium", "Lifestyle", "Illuminated"],
  },
  {
    id: "abuja-airport-road",
    city: "Abuja",
    area: "Airport Road",
    landmark: "Airport route visibility",
    billboardType: "Digital Billboard",
    size: "48ft x 14ft",
    estimatedDailyImpressions: "90,000+",
    availability: "Available Soon",
    priceRange: "Contact for pricing",
    lighting: "Digital display",
    description:
      "A high-visibility digital placement along the route to Nnamdi Azikiwe International Airport — ideal for travel, hospitality and telecom brands.",
    nearbyBusinesses: ["Hotels", "Travel agencies", "Conference venues", "Corporate parks"],
    recommendedIndustries: ["Travel", "Hospitality", "Telecom", "Government Campaigns", "Events"],
    image: locAbuja,
    tags: ["Digital", "Travel", "High Reach"],
  },
];

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
