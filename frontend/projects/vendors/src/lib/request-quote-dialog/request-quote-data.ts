import { Vendor } from '@giddy/api';

export interface RequestQuoteData {
  partyId: string;
  vendor: Vendor;
  /** For example "45 min · ages 4–10". */
  detail: string;
  date: string;
  start: string;
  kids: number;
  location: string;
  message: string;
}
