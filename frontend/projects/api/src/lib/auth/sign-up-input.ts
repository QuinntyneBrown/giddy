export interface SignUpInput {
  firstName: string;
  email: string;
  password: string;
  postalCode: string;
  /** Party ideas and reminders by email. */
  marketing: boolean;
}
