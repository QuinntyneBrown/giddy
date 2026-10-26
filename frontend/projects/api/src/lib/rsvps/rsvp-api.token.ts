import { InjectionToken } from '@angular/core';
import { RsvpApi } from './rsvp-api';

export const RSVP_API = new InjectionToken<RsvpApi>('RSVP_API');
