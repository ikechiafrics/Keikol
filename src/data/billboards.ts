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
