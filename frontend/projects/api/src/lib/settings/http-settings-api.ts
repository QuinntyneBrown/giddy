import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationChoices } from './notification-choices';
import { ProfileInput } from './profile-input';
import { Settings } from './settings';
import { SettingsApi } from './settings-api';

@Injectable()
export class HttpSettingsApi implements SettingsApi {
  private readonly http = inject(HttpClient);

  get(): Observable<Settings> {
    return this.http.get<Settings>('/api/settings');
  }

  saveProfile(profile: ProfileInput): Observable<Settings> {
    return this.http.put<Settings>('/api/settings/profile', profile);
  }

  saveNotifications(choices: NotificationChoices): Observable<Settings> {
    return this.http.put<Settings>('/api/settings/notifications', choices);
  }

  setQuietHours(on: boolean): Observable<Settings> {
    return this.http.put<Settings>('/api/settings/quiet-hours', { on });
  }

  changeEmail(email: string): Observable<void> {
    return this.http.post<void>('/api/settings/email', { email });
  }
}
