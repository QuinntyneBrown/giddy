import { TurnEvent } from './turn-event';

export interface Turn {
  turnId: string;
  status: 'running' | 'completed' | 'cancelled' | 'failed';
  events: TurnEvent[];
}
