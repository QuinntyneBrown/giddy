import { InjectionToken } from '@angular/core';
import { PartiesApi } from './parties-api';

export const PARTIES_API = new InjectionToken<PartiesApi>('PARTIES_API');
