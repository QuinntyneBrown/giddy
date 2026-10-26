import { ChangeDetectionStrategy, Component } from '@angular/core';

/** A framed, sideways-scrolling container for a table, so only the table scrolls on phones. */
@Component({
  selector: 'giddy-table-wrap',
  templateUrl: './table-wrap.html',
  styleUrl: './table-wrap.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'table-wrap',
    tabindex: '0',
    role: 'region',
    '[attr.aria-label]': '"Scrollable table"',
  },
})
export class TableWrapComponent {}
