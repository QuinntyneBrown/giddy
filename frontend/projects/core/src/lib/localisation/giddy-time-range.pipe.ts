import { Pipe, PipeTransform } from '@angular/core';
import { formatTimeRange } from './toronto-format';

/** "1:00–3:30 pm" from two 24-hour local times. */
@Pipe({ name: 'giddyTimeRange' })
export class GiddyTimeRangePipe implements PipeTransform {
  transform(start: string, end: string): string {
    return formatTimeRange(start, end);
  }
}
