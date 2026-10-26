import { RowNote } from './row-note';

/** POST /api/parties/{id}/imports/check: what importing the file would do. */
export interface ImportPreview {
  fileName: string;
  rows: number;
  /** Rows that will become guests. */
  ready: number;
  missingEmail: RowNote[];
  duplicates: RowNote[];
}
