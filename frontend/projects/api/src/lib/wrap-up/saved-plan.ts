/** A party's plan saved to start next year's party from. */
export interface SavedPlan {
  templateId: string;
  /** ISO date of Giddy's reminder, about eight weeks before the child's next birthday. */
  remindOn: string | null;
}
