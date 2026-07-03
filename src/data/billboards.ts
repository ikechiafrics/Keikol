import heroImg from "@/assets/hero-billboard.jpg";
import campRealEstate from "@/assets/camp-realestate.jpg";
import campRestaurant from "@/assets/camp-restaurant.jpg";
import campTelecom from "@/assets/camp-telecom.jpg";
import campFmcg from "@/assets/portfolio-fmcg.jpg";
import campFashion from "@/assets/portfolio-fashion.jpg";
import campEducation from "@/assets/portfolio-education.jpg";

export type Availability = "Available" | "Coming Soon" | "Available Soon" | "Not Available";
export type BillboardType =
  | "Digital Billboard"
  | "Static Billboard"
  | "Premium Static Billboard"
  | "Static Gantry"
  | "Digital Gantry"
  | "Static Unipole"
  | "Digital Unipole";

// Shared with the booking form's "Campaign Duration" select — a billboard's
// rates and a customer's booking duration are the same set of options, kept
// as one source of truth so they can't drift apart.
export const BILLBOARD_DURATIONS = ["1 Week", "2 Weeks", "1 Month", "3 Months", "1 Year"] as const;
export type BillboardDuration = (typeof BILLBOARD_DURATIONS)[number];

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
  // Price per campaign duration — not every duration needs a rate (e.g. some
  // billboards might not offer a 1-week rate). "Price Tier"/"Price Range"
  // display strings are derived from this rather than entered separately.
  rates: Partial<Record<BillboardDuration, number>>;
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

export const BILLBOARD_TYPES = [
  "All",
  "Digital Billboard",
  "Static Billboard",
  "Premium Static Billboard",
  "Static Gantry",
  "Digital Gantry",
  "Static Unipole",
  "Digital Unipole",
] as const;
export const AVAILABILITIES = [
  "All",
  "Available",
  "Coming Soon",
  "Available Soon",
  "Not Available",
] as const;
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
    img: campFmcg,
    title: "FMCG Product Launch",
    location: "Kano",
    campaignType: "Consumer Awareness Campaign",
    category: "FMCG",
    description:
      "A campaign designed to support product recognition and retail demand in busy commercial areas.",
  },
  {
    img: campFashion,
    title: "Fashion Collection Drop",
    location: "Victoria Island",
    campaignType: "Lifestyle Visibility Campaign",
    category: "Fashion",
    description:
      "A premium visual campaign for fashion brands looking to create aspiration and high-end brand presence.",
  },
  {
    img: campEducation,
    title: "Education Admissions Campaign",
    location: "Abuja",
    campaignType: "Public Awareness Campaign",
    category: "Education",
    description:
      "A campaign concept for schools and training institutions promoting admissions or new programs.",
  },
];

export { heroImg };
