/** The tabs across a party's pages; more appear as their pages arrive. */
export function partySections(partyId: string): { label: string; link: string }[] {
  return [
    { label: 'Overview', link: `/parties/${partyId}` },
    { label: 'Guests', link: `/parties/${partyId}/guests` },
    { label: 'Invites', link: `/parties/${partyId}/invite` },
    { label: 'Budget', link: `/parties/${partyId}/budget` },
    { label: 'Checklist', link: `/parties/${partyId}/checklist` },
    { label: 'Party day', link: `/parties/${partyId}/day` },
  ];
}
