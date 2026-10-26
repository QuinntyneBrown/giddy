import { InjectionToken } from '@angular/core';
import { InvitationsApi } from './invitations-api';

export const INVITATIONS_API = new InjectionToken<InvitationsApi>('INVITATIONS_API');
