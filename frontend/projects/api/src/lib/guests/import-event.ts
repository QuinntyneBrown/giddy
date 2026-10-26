import { ImportReport } from './import-report';

/** Upload progress while a class list is sent, then the import's report. */
export type ImportEvent =
  { kind: 'progress'; percent: number } | { kind: 'done'; report: ImportReport };
