import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthApi } from './auth-api';
import { ResetInput } from './reset-input';
import { SignInInput } from './sign-in-input';
import { SignUpInput } from './sign-up-input';
import { SignedIn } from './signed-in';

@Injectable()
export class HttpAuthApi implements AuthApi {
  private readonly http = inject(HttpClient);

  signUp(input: SignUpInput): Observable<{ email: string }> {
    return this.http.post<{ email: string }>('/api/auth/sign-up', input);
  }

  verify(token: string): Observable<SignedIn> {
    return this.http.post<SignedIn>('/api/auth/verify', { token });
  }

  resendVerification(email: string): Observable<void> {
    return this.http.post<void>('/api/auth/verify/resend', { email });
  }

  signIn(input: SignInInput): Observable<SignedIn> {
    return this.http.post<SignedIn>('/api/auth/sign-in', input);
  }

  signOut(): Observable<void> {
    return this.http.post<void>('/api/auth/sign-out', {});
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>('/api/auth/password/forgot', { email });
  }

  checkReset(token: string): Observable<{ email: string }> {
    return this.http.get<{ email: string }>(
      `/api/auth/password/reset/${encodeURIComponent(token)}`,
    );
  }

  resetPassword(input: ResetInput): Observable<SignedIn> {
    return this.http.post<SignedIn>('/api/auth/password/reset', input);
  }
}
