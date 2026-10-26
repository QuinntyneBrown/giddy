import { Child } from '@giddy/api';

/** The saved child, or null when they were removed. */
export interface ChildDialogResult {
  child: Child | null;
  name: string;
}
