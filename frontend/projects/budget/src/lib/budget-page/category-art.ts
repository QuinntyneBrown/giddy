import { PopColour } from '@giddy/components';

/** The emoji and colour for each plan item and cost category, in the meter, legend and table. */
export const categoryArt: Record<string, { emoji: string; pop: PopColour }> = {
  Venue: { emoji: '📍', pop: 'sky' },
  Entertainer: { emoji: '🧪', pop: 'sun' },
  Entertainment: { emoji: '🎭', pop: 'sun' },
  Activity: { emoji: '🎨', pop: 'sun' },
  Cake: { emoji: '🎂', pop: 'pink' },
  'Food & cake': { emoji: '🍰', pop: 'pink' },
  Food: { emoji: '🍕', pop: 'orange' },
  'Loot bags': { emoji: '🎁', pop: 'mint' },
  Decorations: { emoji: '🎈', pop: 'grape' },
};

export const otherArt = { emoji: '✨', pop: 'grape' as PopColour };
