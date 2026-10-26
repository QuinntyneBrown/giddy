/** Notes for the venue, pre-filled from the party's allergies: "Peanut and gluten allergies in the group." */
export function allergyNotes(allergies: string[]): string {
  if (!allergies.length) return '';
  const names = allergies.map((a, i) => (i === 0 ? a[0].toUpperCase() + a.slice(1) : a));
  const list =
    names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
  return `${list} ${names.length === 1 ? 'allergy' : 'allergies'} in the group.`;
}
