/** A row of an import that was or will be skipped, and why. */
export interface RowNote {
  row: number;
  child: string;
  reason: string;
}
