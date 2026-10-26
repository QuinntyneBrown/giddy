/** The emoji beside each quick call, by its role. */
export function callEmoji(role: string): string {
  if (role.endsWith('host') || role === 'Venue') return '📍';
  return (
    ({ Entertainer: '🎭', Food: '🍕', Cake: '🎂', 'Loot bags': '🎁' } as Record<string, string>)[
      role
    ] ?? '📞'
  );
}
