import { ToastTone } from '@giddy/components';

/** A message on the checklist; persistent ones stay until dismissed. */
export interface ChecklistToast {
  id: number;
  heading: string;
  text: string;
  tone: ToastTone;
  persistent: boolean;
}
