import { Child, Interest } from '@giddy/api';

export interface ChildDialogData {
  interests: Interest[];
  /** The child to change, or null to add one. */
  child: Child | null;
}
