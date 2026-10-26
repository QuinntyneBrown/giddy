/** What a new party started from a saved plan takes over. */
export interface PlanTemplate {
  templateId: string;
  name: string;
  childId: string | null;
  childName: string | null;
  theme: string | null;
}
