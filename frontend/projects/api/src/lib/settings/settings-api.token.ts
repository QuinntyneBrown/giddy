import { InjectionToken } from '@angular/core';
import { SettingsApi } from './settings-api';

export const SETTINGS_API = new InjectionToken<SettingsApi>('SETTINGS_API');
