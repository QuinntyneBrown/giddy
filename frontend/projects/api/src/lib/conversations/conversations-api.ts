import { Observable } from 'rxjs';
import { Conversation } from './conversation';
import { MessageAccepted } from './message-accepted';
import { Turn } from './turn';

export interface ConversationsApi {
  /** The parent's latest conversation, started for their next party when there is none. */
  current(): Observable<Conversation>;
  /** New chat. */
  start(): Observable<Conversation>;
  send(conversationId: string, text: string): Observable<MessageAccepted>;
  /** Events after the given sequence number. */
  turn(conversationId: string, turnId: string, after: number): Observable<Turn>;
  cancel(conversationId: string, turnId: string): Observable<void>;
}
