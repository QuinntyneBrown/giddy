export interface ProposalItem {
  category: string;
  catalogueItemId: string;
  name: string;
  detail: string;
  /** Canadian dollars, HST included, from the catalogue. */
  price: number;
  /** Set when the item is not free of a party allergy, for example "Not peanut-free". */
  allergyNote: string | null;
}
