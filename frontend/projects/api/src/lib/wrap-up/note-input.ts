export interface NoteInput {
  gift: string | null;
  /** The parent's own wording; null keeps Giddy's draft, which follows the gift. */
  message: string | null;
}
