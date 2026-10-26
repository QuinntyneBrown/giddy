import { Directive, ElementRef, inject, input } from '@angular/core';
import { FormFieldComponent } from './form-field';

/** Styles a native control and links it to its giddy-form-field's label, help and error. */
@Directive({
  selector: 'input[giddyInput], select[giddyInput], textarea[giddyInput]',
  host: {
    '[class.input]': '!isSelect',
    '[class.select]': 'isSelect',
    '[class.input--sm]': "size() === 'sm'",
    '[id]': 'field?.controlId()',
    '[attr.aria-describedby]': 'field?.describedBy()',
    '[attr.aria-invalid]': "field?.error() ? 'true' : null",
  },
})
export class InputDirective {
  protected readonly field = inject(FormFieldComponent, { optional: true });
  protected readonly isSelect =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName === 'SELECT';
  readonly size = input<'sm' | 'md'>('md');
}
