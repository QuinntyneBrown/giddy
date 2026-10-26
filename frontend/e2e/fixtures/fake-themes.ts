import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

type Row = [string, string, string, number, number, boolean, boolean, boolean];

const rows: Row[] = [
  ['Dino Dig', '🦕', 'Fossil hunt, volcano science and dino eggs.', 4, 9, false, false, true],
  ['Space Explorers', '🚀', 'Rockets, planets and a moon walk.', 5, 10, false, true, false],
  [
    'Under the Sea',
    '🐠',
    'Bubble stations, mermaid tails and treasure.',
    3,
    8,
    false,
    false,
    false,
  ],
  [
    'Unicorn Rainbow',
    '🦄',
    'Glitter horns, rainbow cake and a magic hunt.',
    3,
    6,
    false,
    false,
    false,
  ],
  ['Superhero City', '🦸', 'Capes, obstacle courses and hero training.', 4, 10, false, true, false],
  [
    'Mad Science Lab',
    '🧪',
    'Slime, fizzing potions and a lab coat each.',
    6,
    12,
    false,
    false,
    true,
  ],
  [
    'Pirate Adventure',
    '🏴‍☠️',
    'A treasure map, eye patches and a ship to sail.',
    4,
    9,
    true,
    true,
    false,
  ],
  ['Jungle Safari', '🦁', 'Animal masks, binoculars and a safari trail.', 3, 8, true, true, false],
  ['Art Studio', '🎨', 'Paint, clay and a gallery of their own work.', 5, 12, false, true, false],
  ['Sports Day', '⚽', 'Relay races, sack races and medals for all.', 6, 12, true, true, false],
  [
    'Detective Mystery',
    '🔍',
    'Clues, codes and a case to crack together.',
    8,
    12,
    false,
    true,
    false,
  ],
  [
    'Camping Under the Stars',
    '⛺',
    'A tent, flashlights and s’mores without the fire.',
    6,
    12,
    true,
    false,
    false,
  ],
  ['Princess Tea Party', '👑', 'Crowns, tea cups and a royal ball.', 3, 7, false, false, false],
];

/** The theme catalogue and choosing a party's theme, as the API answers them. */
export class FakeThemes {
  themes = rows.map(
    ([name, emoji, description, minAge, maxAge, outdoor, budgetFriendly, interests], i) => ({
      id: `a1000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
      name,
      emoji,
      description,
      minAge,
      maxAge,
      outdoor,
      budgetFriendly,
      interests,
    }),
  );
  /** The party's theme. */
  partyTheme: string | null = 'Dino Dig';
  /** Theme ids sent to PUT /api/parties/{id}/theme, newest last. */
  chosen: (string | null)[] = [];

  register(on: Register): void {
    on('GET', '/api/themes', (request) => {
      const params = new URL(request.url()).searchParams;
      const forChild = params.get('forChild') !== 'false';
      const [bandMin, bandMax] = (params.get('ageBand') ?? '').split('-').map(Number);
      const results = this.themes
        .filter((t) => !forChild || (t.minAge <= 7 && 7 <= t.maxAge))
        .filter((t) => !params.get('ageBand') || (t.minAge <= bandMax && t.maxAge >= bandMin))
        .filter((t) => params.get('outdoor') !== 'true' || t.outdoor)
        .filter((t) => params.get('budget') !== 'true' || t.budgetFriendly)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ interests, ...t }) => ({
          ...t,
          matchesInterests: interests,
          chosen: t.name === this.partyTheme,
        }));
      return {
        body: {
          total: this.themes.length,
          child: { name: 'Zuri', age: 7 },
          forChild,
          partyTheme: this.partyTheme,
          results,
        },
      };
    });
    on('PUT', '/api/parties/:partyId/theme', (request) => {
      const { themeId } = request.postDataJSON() as { themeId: string | null };
      this.chosen.push(themeId);
      const previous = this.partyTheme;
      const theme = themeId ? this.themes.find((t) => t.id === themeId) : null;
      if (themeId && !theme) return { status: 404 };
      this.partyTheme = theme?.name ?? null;
      return {
        body: {
          theme: this.partyTheme,
          previous: previous
            ? { id: this.themes.find((t) => t.name === previous)?.id ?? null, name: previous }
            : null,
        },
      };
    });
  }
}
