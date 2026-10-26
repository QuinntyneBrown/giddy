import { ChatMessage } from '@giddy/api';

/** A message as the page shows it: sent, still sending, or not sent and waiting for the parent. */
export interface ChatEntry {
  message: ChatMessage;
  status: 'sent' | 'sending' | 'failed';
}
