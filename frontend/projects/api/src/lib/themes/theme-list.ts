import { Theme } from './theme';

/** GET /api/themes */
export interface ThemeList {
  /** Every theme in the catalogue, before filters. */
  total: number;
  child: { name: string; age: number } | null;
  forChild: boolean;
  partyTheme: string | null;
  results: Theme[];
}
