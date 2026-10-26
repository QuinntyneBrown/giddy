export interface RelaxationSuggestion {
  label: string;
  /** The search parameter to change, for example "maxPrice". */
  filter: 'maxPrice' | 'nutFree' | 'parking' | 'stepFree' | 'indoor' | 'radiusKm';
  value: string;
  count: number;
}
