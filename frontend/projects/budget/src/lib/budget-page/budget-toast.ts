import { ToastTone } from '@giddy/components';

/** A message on the budget page; persistent ones stay until dismissed. */
export interface BudgetToast {
  id: number;
  heading: string;
  text: string;
  tone: ToastTone;
  persistent: boolean;
}
