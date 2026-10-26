import { RowNote } from './row-note';

export interface ImportReport {
  imported: number;
  skipped: RowNote[];
}
