/** A venue or vendor the party booked, with this party's rating once given. */
export interface RatedProvider {
  providerId: string;
  name: string;
  category: string;
  stars: number | null;
  review: string | null;
}
