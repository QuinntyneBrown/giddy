/** The tabs across a party's pages; more appear as their pages arrive. */
export function partySections(partyId: string): { label: string; link: string }[] {
  return [
    { label: 'Overview', link: `/parties/${partyId}` },
    { label: 'Guests', link: `/parties/${partyId}/guests` },
    { label: 'Invites', link: `/parties/${partyId}/invite` },
  ];
}
