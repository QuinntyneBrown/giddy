import { Pipe, PipeTransform } from '@angular/core';
import { formatMoney } from './toronto-format';

/** "$95" or "$95.50" in Canadian dollars, HST included. */
@Pipe({ name: 'giddyMoney' })
export class GiddyMoneyPipe implements PipeTransform {
  transform(amount: number): string {
    return formatMoney(amount);
  }
}
