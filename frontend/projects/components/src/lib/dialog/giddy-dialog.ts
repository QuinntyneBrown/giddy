import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { Injectable, inject } from '@angular/core';

let nextId = 0;

/**
 * Opens a modal on the Angular CDK: focus moves in and is trapped, the page behind is inert,
 * Esc closes it and focus returns to the trigger. The component should use giddy-dialog.
 */
@Injectable({ providedIn: 'root' })
export class GiddyDialog {
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);

  /** autoFocus is a CSS selector for the element to focus first; the first focusable by default. */
  open<TResult, TData, TComponent>(
    component: ComponentType<TComponent>,
    data: TData,
    options: { autoFocus?: string } = {},
  ): DialogRef<TResult, TComponent> {
    const id = `giddy-dialog-${nextId++}`;
    return this.dialog.open<TResult, TData, TComponent>(component, {
      id,
      data,
      ariaLabelledBy: `${id}-title`,
      ariaDescribedBy: `${id}-description`,
      ariaModal: true,
      hasBackdrop: true,
      backdropClass: 'backdrop',
      panelClass: 'dialog',
      // The pane fills the viewport; the design system's .dialog places the panel inside it.
      positionStrategy: this.overlay.position().global().top('0').left('0'),
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      autoFocus: options.autoFocus ?? 'first-tabbable',
      restoreFocus: true,
    });
  }
}
