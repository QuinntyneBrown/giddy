/** What happened when changes made offline were sent. */
export interface SyncResult {
  synced: number;
  conflicts: number;
}
