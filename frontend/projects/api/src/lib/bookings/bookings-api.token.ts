import { InjectionToken } from '@angular/core';
import { BookingsApi } from './bookings-api';

export const BOOKINGS_API = new InjectionToken<BookingsApi>('BOOKINGS_API');
