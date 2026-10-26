export interface HomeParty {
  id: string;
  name: string;
  date: string;
  startsAt: string;
  endsAt: string;
  daysToGo: number;
  venueName: string | null;
  guests: number | null;
  readiness: number;
  doneSteps: number;
  totalSteps: number;
  nextStep: string | null;
}
