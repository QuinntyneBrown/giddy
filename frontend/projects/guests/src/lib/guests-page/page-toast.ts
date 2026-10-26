import { ToastTone } from '@giddy/components';

/** A message on the guest list; persistent ones stay until dismissed. */
export interface PageToast {
  id: number;
  heading: string;
  text: string;
  tone: ToastTone;
  action: { label: string; link: string; fragment?: string } | null;
  persistent: boolean;
}
