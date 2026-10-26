import { Vendor } from './vendor';
import { VendorCategory } from './vendor-category';

/** GET /api/vendors/search */
export interface VendorSearchResult {
  category: VendorCategory;
  date: string;
  /** The booked venue, or the party's area. */
  place: string | null;
  theme: string | null;
  themeOn: boolean;
  results: Vendor[];
  /** Food only: the allergies to plan for, by allergen and child. */
  allergies: { allergen: string; children: string[] }[];
  noResults: {
    conflicts: string[];
    suggestion: { label: string; filter: 'maxPrice' | 'theme'; value: string } | null;
  } | null;
}
