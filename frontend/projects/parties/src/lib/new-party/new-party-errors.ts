import { addDays, torontoToday } from '@giddy/core';
import { NewPartyForm, someoneElse } from './new-party-form';

export type NewPartyField =
  'childName' | 'turningAge' | 'date' | 'guests' | 'budget' | 'postalCode';

export const fieldOrder: NewPartyField[] = [
  'childName',
  'turningAge',
  'date',
  'guests',
  'budget',
  'postalCode',
];

const postalCodePattern = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

/** The same rules the API applies, checked first so parents get instant, specific fixes. */
export function validateNewParty(
  form: NewPartyForm,
  now = new Date(),
): Partial<Record<NewPartyField, string>> {
  const value = form.getRawValue();
  const errors: Partial<Record<NewPartyField, string>> = {};
  if (value.child === someoneElse) {
    if (!value.childName.trim() || value.childName.trim().length > 40) {
      errors.childName = 'Tell us the birthday star’s first name';
    }
    const age = Number(value.turningAge);
    if (!Number.isInteger(age) || age < 1 || age > 17) {
      errors.turningAge = 'Enter the age they’re turning, from 1 to 17';
    }
  }
  if (!value.date || value.date < addDays(torontoToday(now), 1)) {
    errors.date = 'Pick a date from tomorrow onwards';
  }
  const guests = Number(value.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 60) {
    errors.guests = 'Enter how many kids, from 1 to 60';
  }
  const budget = Number(value.budget);
  if (value.budget.trim() === '' || !Number.isFinite(budget) || budget < 0 || budget > 20000) {
    errors.budget = 'Enter a budget in dollars, like 800';
  }
  if (!postalCodePattern.test(value.postalCode.trim())) {
    errors.postalCode = 'Enter a Canadian postal code, like M4M 1H1';
  }
  return errors;
}
