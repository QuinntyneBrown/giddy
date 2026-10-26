export interface TaskInput {
  title: string;
  /** yyyy-MM-dd. */
  due: string;
  ownerId: string | null;
  remindMe: boolean;
}
