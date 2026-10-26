import { LiveUpdate } from './live-update';

/** GET /api/live-updates?after= */
export interface LiveUpdates {
  events: LiveUpdate[];
  /** Pass back as "after" for only newer updates. */
  cursor: number;
}
