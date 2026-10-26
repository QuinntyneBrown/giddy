import { ChatMessage } from './chat-message';
import { Memory } from './memory';
import { PartyAtAGlance } from './party-at-a-glance';

export interface Conversation {
  id: string;
  party: PartyAtAGlance | null;
  messages: ChatMessage[];
  memories: Memory[];
  /** A turn still in progress, so the page can keep following it. */
  runningTurnId: string | null;
}
