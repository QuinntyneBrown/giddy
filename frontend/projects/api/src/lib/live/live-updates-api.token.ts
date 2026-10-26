import { InjectionToken } from '@angular/core';
import { LiveUpdatesApi } from './live-updates-api';

export const LIVE_UPDATES_API = new InjectionToken<LiveUpdatesApi>('LIVE_UPDATES_API');
