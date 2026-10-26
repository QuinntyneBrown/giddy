import { FormControl, FormGroup } from '@angular/forms';
import { TimeOfDay } from '@giddy/api';

/** The basics of a new party. `child` is a child's id or "someone-else". */
export type NewPartyForm = FormGroup<{
  child: FormControl<string>;
  childName: FormControl<string>;
  turningAge: FormControl<string>;
  date: FormControl<string>;
  guests: FormControl<string>;
  timeOfDay: FormControl<TimeOfDay>;
  budget: FormControl<string>;
  postalCode: FormControl<string>;
}>;

export const someoneElse = 'someone-else';

export function newPartyForm(): NewPartyForm {
  const text = (value = '') => new FormControl(value, { nonNullable: true });
  return new FormGroup({
    child: text(someoneElse),
    childName: text(),
    turningAge: text(),
    date: text(),
    guests: text(),
    timeOfDay: new FormControl<TimeOfDay>('afternoon', { nonNullable: true }),
    budget: text(),
    postalCode: text(),
  });
}
