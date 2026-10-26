/** How the cost dialog closed: what happened to which cost. */
export interface CostDialogResult {
  outcome: 'added' | 'changed' | 'removed';
  name: string;
}
