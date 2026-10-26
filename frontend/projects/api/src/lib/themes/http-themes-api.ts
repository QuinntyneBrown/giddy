import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ThemeChange } from './theme-change';
import { ThemeFilters } from './theme-filters';
import { ThemeList } from './theme-list';
import { ThemesApi } from './themes-api';

@Injectable()
export class HttpThemesApi implements ThemesApi {
  private readonly http = inject(HttpClient);

  list(partyId: string | null, filters: ThemeFilters): Observable<ThemeList> {
    const params: Record<string, string> = { forChild: String(filters.forChild) };
    if (partyId) params['partyId'] = partyId;
    if (filters.ageBand) params['ageBand'] = filters.ageBand;
    if (filters.outdoor) params['outdoor'] = 'true';
    if (filters.budget) params['budget'] = 'true';
    return this.http.get<ThemeList>('/api/themes', { params });
  }

  choose(partyId: string, themeId: string | null): Observable<ThemeChange> {
    return this.http.put<ThemeChange>(`/api/parties/${partyId}/theme`, { themeId });
  }
}
