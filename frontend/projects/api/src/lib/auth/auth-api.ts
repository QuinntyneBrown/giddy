import { Observable } from 'rxjs';
import { ResetInput } from './reset-input';
import { SignInInput } from './sign-in-input';
import { SignUpInput } from './sign-up-input';
import { SignedIn } from './signed-in';

export interface AuthApi {
  /** Creates an unverified account and emails a confirmation link; 409 when the email has one. */
  signUp(input: SignUpInput): Observable<{ email: string }>;
  /** Opens a confirmation link and signs in; 410 with the email when it has expired. */
  verify(token: string): Observable<SignedIn>;
  /** 429 with retryAfterSeconds within a minute of the last link. */
  resendVerification(email: string): Observable<void>;
  signIn(input: SignInInput): Observable<SignedIn>;
  signOut(): Observable<void>;
  forgotPassword(email: string): Observable<void>;
  /** Whose reset link this is; 410 when it has expired or been used. */
  checkReset(token: string): Observable<{ email: string }>;
  resetPassword(input: ResetInput): Observable<SignedIn>;
}
