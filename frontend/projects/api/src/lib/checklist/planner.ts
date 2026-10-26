/** Someone a task can be given to: the owner or a co-planner. */
export interface Planner {
  parentId: string;
  name: string;
  isYou: boolean;
}
