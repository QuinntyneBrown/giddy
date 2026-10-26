import { InjectionToken } from '@angular/core';
import { MemoriesApi } from './memories-api';

export const MEMORIES_API = new InjectionToken<MemoriesApi>('MEMORIES_API');
