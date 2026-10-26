import { IconName } from './icon-name';
import { IconShape } from './icon-shape';

const path = (d: string): IconShape => ({ kind: 'path', d });
const circle = (cx: number, cy: number, r: number): IconShape => ({ kind: 'circle', cx, cy, r });

/** Line icons on a 24px grid, copied from the design system's iconography. */
export const ICON_SHAPES: Record<IconName, IconShape[]> = {
  alert: [path('M12 3 2 20h20zM12 10v4M12 17h.01')],
  bell: [path('M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0')],
  calendar: [
    { kind: 'rect', x: 3, y: 5, width: 18, height: 16, rx: 3 },
    path('M3 10h18M8 3v4M16 3v4'),
  ],
  check: [path('m5 12 5 5L20 7')],
  close: [path('M6 6l12 12M18 6 6 18')],
  explore: [circle(12, 12, 9), path('m15.5 8.5-2 5-5 2 2-5z')],
  family: [
    circle(9, 8, 3.5),
    path('M2.5 20a6.5 6.5 0 0 1 13 0'),
    circle(17, 9, 2.5),
    path('M16 14a5 5 0 0 1 5.5 5'),
  ],
  food: [
    path(
      'M4 21V13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8zM4 16c2 1.5 4 1.5 5.3 0 1.4 1.5 4 1.5 5.4 0 1.3 1.5 3.3 1.5 5.3 0M12 11V7M12 7c-1 0-1.5-1-1-2l1-2 1 2c.5 1 0 2-1 2z',
    ),
  ],
  home: [path('M3 11 12 4l9 7'), path('M5 10v10h5v-6h4v6h5V10')],
  mail: [{ kind: 'rect', x: 3, y: 5, width: 18, height: 14, rx: 2 }, path('m3 7 9 6 9-6')],
  moon: [path('M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z')],
  parties: [
    path('M12 3a6 6 0 0 0-6 6c0 4 3.5 7 6 7s6-3 6-7a6 6 0 0 0-6-6z'),
    path('M11 16l1 2 1-2M12 18c0 2-2 2-2 4'),
  ],
  pin: [path('M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z'), circle(12, 9.5, 2.5)],
  plus: [path('M12 5v14M5 12h14')],
  refresh: [path('M20 11a8 8 0 0 0-14.6-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5L20 16m0 4v-4h-4')],
  search: [circle(11, 11, 7), path('m20 20-3.5-3.5')],
  settings: [
    circle(12, 12, 3),
    path(
      'M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3.9a7 7 0 0 0-1.7-1L14.5 3h-5l-.4 2.4a7 7 0 0 0-1.7 1L5.1 5.5l-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 1.7 1l.4 2.4h5l.4-2.4a7 7 0 0 0 1.7-1l2.3.9 2-3.4-2-1.5c.1-.3.1-.7.1-1z',
    ),
  ],
  sparkle: [
    path('M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z'),
    path('M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'),
  ],
  sun: [
    circle(12, 12, 4),
    path(
      'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    ),
  ],
  themes: [
    path('M3 21 8 8l8 8z'),
    path('M14 4c0 2 2 2 2 4M18 9h3M17 3l1 2M20 13c-1.5 0-2 1.5-3 1.5'),
  ],
};
