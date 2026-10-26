import { InjectionToken } from '@angular/core';
import { GuestsApi } from './guests-api';

export const GUESTS_API = new InjectionToken<GuestsApi>('GUESTS_API');
