import { VendorCategory } from '@giddy/api';

export const vendorCategories: { value: VendorCategory; label: string; noun: string }[] = [
  { value: 'entertainers', label: 'Entertainers', noun: 'entertainers' },
  { value: 'activities', label: 'Activities', noun: 'activities' },
  { value: 'food', label: 'Food & cake', noun: 'bakeries or caterers' },
  { value: 'rentals', label: 'Rentals', noun: 'rentals' },
];

/** The price chip's ceiling. */
export const priceCeiling = 200;
