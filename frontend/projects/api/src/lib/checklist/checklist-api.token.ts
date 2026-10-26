import { InjectionToken } from '@angular/core';
import { ChecklistApi } from './checklist-api';

export const CHECKLIST_API = new InjectionToken<ChecklistApi>('CHECKLIST_API');
