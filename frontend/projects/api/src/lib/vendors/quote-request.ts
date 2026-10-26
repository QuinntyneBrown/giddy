/** POST /api/parties/{id}/quotes */
export interface QuoteRequest {
  vendorId: string;
  date: string;
  start: string;
  kids: number;
  location: string;
  message: string;
}
