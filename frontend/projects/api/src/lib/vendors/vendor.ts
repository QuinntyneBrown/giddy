import { VendorPlanStatus } from './vendor-plan-status';

/** A vendor free on the party date who travels or delivers to the party. */
export interface Vendor {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
  neighbourhood: string;
  price: number;
  priceBasis: string;
  rating: number;
  reviewCount: number;
  durationMinutes: number | null;
  minAge: number | null;
  maxAge: number | null;
  noticeDays: number | null;
  /** nut-free, gluten-free, dairy-free, vegan. */
  dietary: string[];
  /** Whether the vendor can meet each of the party's allergies. */
  allergyFit: { allergen: string; ok: boolean }[];
  planStatus: VendorPlanStatus | null;
}
