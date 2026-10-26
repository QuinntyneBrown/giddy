import { Pipe, PipeTransform } from '@angular/core';
import { formatRelativeDays } from './toronto-format';

/** "Today", "Tomorrow" or "in 20 days" from a count of calendar days. */
@Pipe({ name: 'giddyRelativeDays' })
export class GiddyRelativeDaysPipe implements PipeTransform {
  transform(days: number): string {
    return formatRelativeDays(days);
  }
}
