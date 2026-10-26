import { InjectionToken } from '@angular/core';
import { VenuesApi } from './venues-api';

export const VENUES_API = new InjectionToken<VenuesApi>('VENUES_API');
