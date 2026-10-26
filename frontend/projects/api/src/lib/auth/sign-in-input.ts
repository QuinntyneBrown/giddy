export interface SignInInput {
  email: string;
  password: string;
  /** Thirty days from the last activity; otherwise until the browser closes. */
  keepSignedIn: boolean;
}
