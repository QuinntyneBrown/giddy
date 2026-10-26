import { InjectionToken } from '@angular/core';
import { ThemesApi } from './themes-api';

export const THEMES_API = new InjectionToken<ThemesApi>('THEMES_API');
