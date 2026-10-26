/** POST /api/parties/{id}/invitation/send */
export interface InvitationsSent {
  sent: number;
  automaticReminderOn: string;
}
