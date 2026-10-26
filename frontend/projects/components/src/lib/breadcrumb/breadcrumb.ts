import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbItem } from './breadcrumb-item';

/** Where this page sits; the last item is the current page. */
@Component({
  selector: 'nav[giddy-breadcrumb]',
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-label': 'Breadcrumb' },
})
export class BreadcrumbComponent {
  readonly items = input.required<BreadcrumbItem[]>();
}
