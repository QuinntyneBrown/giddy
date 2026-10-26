import { InjectionToken } from '@angular/core';
import { ConversationsApi } from './conversations-api';

export const CONVERSATIONS_API = new InjectionToken<ConversationsApi>('CONVERSATIONS_API');
