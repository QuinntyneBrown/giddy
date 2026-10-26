import { InjectionToken } from '@angular/core';
import { BudgetApi } from './budget-api';

export const BUDGET_API = new InjectionToken<BudgetApi>('BUDGET_API');
