import { Proposal } from './proposal';
import { ToolStep } from './tool-step';

export interface ChatMessage {
  id: string;
  author: 'parent' | 'giddy';
  text: string;
  /** ISO instant. */
  sentAt: string;
  steps: ToolStep[];
  suggestions: string[];
  proposal: Proposal | null;
}
