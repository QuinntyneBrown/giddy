export interface TurnEvent {
  sequence: number;
  type: 'step.started' | 'step.done' | 'reply.done' | 'turn.failed' | 'turn.cancelled';
  stepId: string | null;
  text: string | null;
  messageId: string | null;
}
