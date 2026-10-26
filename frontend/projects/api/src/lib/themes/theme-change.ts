/** PUT /api/parties/{id}/theme */
export interface ThemeChange {
  theme: string | null;
  /** The theme before, for Undo; null when there was none. */
  previous: { id: string | null; name: string } | null;
}
