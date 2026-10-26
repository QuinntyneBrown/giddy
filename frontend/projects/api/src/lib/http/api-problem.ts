/** An RFC 7807 problem returned by the Giddy API. */
export interface ApiProblem {
  status: number;
  title: string;
  /** Present on unexpected failures, for example "GDY-7Q2K". */
  referenceCode?: string;
  /** Field errors on validation failures, keyed by camelCase field name. */
  errors?: Record<string, string[]>;
}
