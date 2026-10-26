import { PartySummary } from '@giddy/api';

/** The party venue pages plan for: the one asked for, or the soonest party that hasn't happened. */
export function pickParty(
  parties: PartySummary[],
  partyId: string | null | undefined,
): PartySummary | null {
  if (partyId) return parties.find((p) => p.id === partyId) ?? null;
  return (
    [...parties]
      .filter((p) => p.status !== 'past')
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null
  );
}
