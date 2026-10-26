import { Child } from './child';

export interface Family {
  postalCode: string | null;
  /** The neighbourhood for the postal code, for example Leslieville. */
  areaName: string | null;
  children: Child[];
}
