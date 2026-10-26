const key = 'giddy.dismissed-booking-notices';

/** Booking banners this browser has dismissed, as "kind:bookingId". A per-viewer convenience. */
export function dismissedNotices(): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function rememberDismissed(id: string): void {
  try {
    localStorage.setItem(key, JSON.stringify([...dismissedNotices(), id].slice(-50)));
  } catch {
    // Storage can be blocked; the banner then only stays hidden until the page reloads.
  }
}
