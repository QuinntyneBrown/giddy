import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

let nextId = 0;

/**
 * A labelled control with help and error text. The projected control (an input, select or
 * textarea with giddy-input) is linked to the label, help and error automatically.
 */
@Component({
  selector: 'giddy-form-field',
  templateUrl: './form-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'field' },
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly help = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly optional = input(false, { transform: booleanAttribute });
  /** The control's id, for links from an error summary; generated when omitted. */
  readonly inputId = input<string | null>(null);
  private readonly generatedId = `giddy-field-${nextId++}`;
  readonly controlId = computed(() => this.inputId() ?? this.generatedId);
  protected readonly helpId = computed(() => `${this.controlId()}-help`);
  protected readonly errorId = computed(() => `${this.controlId()}-error`);

  readonly describedBy = computed(
    () =>
      [this.error() ? this.errorId() : null, this.help() ? this.helpId() : null]
        .filter(Boolean)
        .join(' ') || null,
  );
}
