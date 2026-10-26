import { Observable } from 'rxjs';
import { ThemeChange } from './theme-change';
import { ThemeFilters } from './theme-filters';
import { ThemeList } from './theme-list';

export interface ThemesApi {
  list(partyId: string | null, filters: ThemeFilters): Observable<ThemeList>;
  /** Sets the party's theme, or clears it with null. */
  choose(partyId: string, themeId: string | null): Observable<ThemeChange>;
}
