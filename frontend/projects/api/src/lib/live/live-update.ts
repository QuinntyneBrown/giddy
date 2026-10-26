/** Something that happened on one of the parent's parties, such as a reply. */
export interface LiveUpdate {
  id: number;
  partyId: string;
  guestId: string | null;
  kind: 'opened' | 'replied' | 'changed' | 'allergy' | 'bounced' | 'quote';
  tone: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  text: string;
  action: { label: string; kind: 'share-allergies' | 'fix-email' | 'view-guests' } | null;
}
