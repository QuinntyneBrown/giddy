import { InjectionToken } from '@angular/core';
import { FamilyApi } from './family-api';

export const FAMILY_API = new InjectionToken<FamilyApi>('FAMILY_API');
