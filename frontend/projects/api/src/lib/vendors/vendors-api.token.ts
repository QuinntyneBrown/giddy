import { InjectionToken } from '@angular/core';
import { VendorsApi } from './vendors-api';

export const VENDORS_API = new InjectionToken<VendorsApi>('VENDORS_API');
