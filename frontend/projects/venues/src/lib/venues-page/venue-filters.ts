import { VenueSearch } from '@giddy/api';

/** The parent's filters on the Venues page, before the party id is added. */
export type VenueFilters = Omit<VenueSearch, 'partyId'>;

export const sortOptions: { value: VenueSearch['sort']; label: string }[] = [
  { value: 'best', label: 'Best match' },
  { value: 'closest', label: 'Closest' },
  { value: 'price', label: 'Price: low to high' },
  { value: 'rating', label: 'Top rated' },
];

export const sortStorageKey = 'giddy-venue-sort';
