import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from './toronto-format';

/** "Sat 14 Nov" from an ISO calendar date; pass true for "Sat 14 Nov 2026". */
@Pipe({ name: 'giddyDate' })
export class GiddyDatePipe implements PipeTransform {
  transform(isoDate: string, withYear = false): string {
    return formatDate(isoDate, withYear);
  }
}
