import { Directive, inject } from '@angular/core';
import { FormFieldComponent } from './form-field';

/** Styles a native control and links it to its giddy-form-field's label, help and error. */
@Directive({
  selector: 'input[giddyInput], select[giddyInput], textarea[giddyInput]',
  host: {
    class: 'input',
    '[id]': 'field?.controlId()',
    '[attr.aria-describedby]': 'field?.describedBy()',
    '[attr.aria-invalid]': "field?.error() ? 'true' : null",
  },
})
export class InputDirective {
  protected readonly field = inject(FormFieldComponent, { optional: true });
}
