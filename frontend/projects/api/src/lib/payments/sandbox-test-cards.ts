import { TestCard } from './test-card';

/**
 * The payment provider's test cards. Until the PCI DSS Level 1 provider is chosen, Giddy runs in
 * test mode: parents pick one of these instead of typing card details, and only its token is
 * sent. Real hosted card fields replace this list when the provider is connected.
 */
export const SANDBOX_TEST_CARDS: readonly TestCard[] = [
  { token: 'tok_visa', label: 'Visa ending 4242 (approved)' },
  { token: 'tok_mastercard', label: 'Mastercard ending 4444 (approved)' },
  { token: 'tok_declined', label: 'Visa ending 0002 (declined)' },
  { token: 'tok_3ds', label: 'Visa ending 3184 (asks your bank to check)' },
];
