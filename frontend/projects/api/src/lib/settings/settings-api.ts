import { Observable } from 'rxjs';
import { NotificationChoices } from './notification-choices';
import { ProfileInput } from './profile-input';
import { Settings } from './settings';

export interface SettingsApi {
  get(): Observable<Settings>;
  saveProfile(profile: ProfileInput): Observable<Settings>;
  saveNotifications(choices: NotificationChoices): Observable<Settings>;
  /** Takes effect straight away. */
  setQuietHours(on: boolean): Observable<Settings>;
  /** Emails a confirmation link to the new address; the old one stays until it is opened. */
  changeEmail(email: string): Observable<void>;
}
