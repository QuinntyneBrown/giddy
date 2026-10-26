export interface ThankYouNote {
  guestId: string;
  childName: string;
  parentName: string;
  gift: string | null;
  message: string;
  status: 'draft' | 'sent';
  /** False when Giddy has no email for the guest's parent. */
  canSend: boolean;
}
