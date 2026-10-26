import { InjectionToken } from '@angular/core';
import { AuthApi } from './auth-api';

export const AUTH_API = new InjectionToken<AuthApi>('AUTH_API');
