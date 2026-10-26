import { Pipe, PipeTransform } from '@angular/core';
import { formatLongDate } from './toronto-format';

/** "Saturday 14 November 2026" from an ISO calendar date. */
@Pipe({ name: 'giddyLongDate' })
export class GiddyLongDatePipe implements PipeTransform {
  transform(isoDate: string): string {
    return formatLongDate(isoDate);
  }
}
