import { VenueResult } from '@giddy/api';
import { formatTime, formatTimeRange } from '@giddy/core';

export function duration(minutes: number): string {
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} h`;
}

/** "Free 1:00–3:30 pm", or "Only 10:00 am–12:00 pm free" when one slot is left. */
export function freeBadge(venue: VenueResult): { text: string; tone: 'success' | 'warning' } {
  const [first] = venue.freeSlots;
  const range = formatTimeRange(first.start, first.end);
  return venue.freeSlots.length === 1
    ? { text: `Only ${range} free`, tone: 'warning' }
    : { text: `Free ${range}`, tone: 'success' };
}

export function slotLabel(start: string): string {
  return formatTime(start);
}
