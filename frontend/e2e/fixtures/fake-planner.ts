import { Request } from '@playwright/test';
import {
  dinoGlance,
  dinoPlan,
  planSteps,
  remembered,
  SeedMemory,
  SeedMessage,
  SeedProposal,
} from './seed-data';

export interface FakeResponse {
  status?: number;
  body?: unknown;
}

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

/** How Giddy answers the next message: work steps, then a reply, a failure, or thinking forever. */
export interface ScriptedTurn {
  steps: string[];
  reply?: { text: string; proposal?: SeedProposal | null; suggestions?: string[] };
  outcome: 'reply' | 'fail' | 'hang';
  /** How long each step takes. */
  stepMs: number;
}

interface FakeTurn {
  id: string;
  script: ScriptedTurn;
  startedAt: number;
  status: 'running' | 'completed' | 'cancelled' | 'failed';
  cancelledAt?: number;
  finished?: boolean;
}

let counter = 0;
const id = () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`;

/**
 * Simulates Giddy's conversations the way the API does: messages, turns whose events appear over
 * time, cancellation, failures, applying a plan and forgetting memories.
 */
export class FakePlanner {
  conversationId = '5e7a0b11-3333-4c4d-8e5f-000000000001';
  glance: typeof dinoGlance | null = { ...dinoGlance };
  messages: SeedMessage[] = [];
  memories: SeedMemory[] = remembered.map((m) => ({ ...m }));
  turns = new Map<string, FakeTurn>();
  /** Answers to the next messages, in order; the plan turn when the list is empty. */
  script: ScriptedTurn[] = [];
  /** When set, POST /plan answers with this status once. */
  applyFailure: number | null = null;
  appliedProposals: string[] = [];

  static planTurn(stepMs = 400): ScriptedTurn {
    return {
      steps: planSteps,
      outcome: 'reply',
      stepMs,
      reply: {
        text: 'Here’s a plan that keeps you $22 under budget and everything is within 10 minutes of home.',
        proposal: { ...dinoPlan, items: dinoPlan.items.map((i) => ({ ...i })) },
      },
    };
  }

  register(on: Register): void {
    on('GET', '/api/conversations/current', () => ({ body: this.view() }));
    on('POST', '/api/conversations', () => {
      this.conversationId = id();
      this.messages = [];
      return { body: this.view() };
    });
    on('POST', '/api/conversations/:conversationId/messages', (request, params) =>
      this.acceptMessage(request, params),
    );
    on('GET', '/api/conversations/:conversationId/turns/:turnId', (request, params) => {
      const turn = this.turns.get(params['turnId']);
      if (!turn) return { status: 404 };
      const after = Number(new URL(request.url()).searchParams.get('after') ?? 0);
      const events = this.events(turn);
      return {
        body: {
          turnId: turn.id,
          status: turn.status,
          events: events.filter((e) => e.sequence > after),
        },
      };
    });
    on('POST', '/api/conversations/:conversationId/turns/:turnId/cancel', (_, params) => {
      const turn = this.turns.get(params['turnId']);
      if (!turn) return { status: 404 };
      if (turn.status === 'running') {
        turn.cancelledAt = Date.now();
        this.events(turn);
      }
      return { status: 202 };
    });
    on('POST', '/api/parties/:partyId/plan', (request, params) => {
      if (this.applyFailure) {
        const status = this.applyFailure;
        this.applyFailure = null;
        return {
          status,
          body: { status, title: 'Something went wrong on our side.', referenceCode: 'GDY-4PLN' },
        };
      }
      const { proposalId } = request.postDataJSON() as { proposalId: string };
      this.appliedProposals.push(proposalId);
      this.messages.forEach((m) => {
        if (m.proposal?.id === proposalId) m.proposal.applied = true;
      });
      this.messages.push(this.giddy(`Plan saved to ${this.glance?.name ?? 'your party'}`));
      return {
        body: {
          partyId: params['partyId'],
          partyName: this.glance?.name,
          theme: 'Dino Dig',
          bookingsToDo: 5,
          estimates: 778,
          checklistTasks: 10,
        },
      };
    });
    on('GET', '/api/memories', () => ({ body: this.memories }));
    on('DELETE', '/api/memories/:memoryId', (_, params) => {
      const before = this.memories.length;
      this.memories = this.memories.filter((m) => m.id !== params['memoryId']);
      return { status: before === this.memories.length ? 404 : 204 };
    });
  }

  /** Saves the parent's message and starts the next scripted turn, as POST /messages does. */
  acceptMessage(request: Request, params: Record<string, string>): FakeResponse {
    if (params['conversationId'] !== this.conversationId) return { status: 404 };
    const text = (request.postDataJSON() as { text?: string }).text?.trim() ?? '';
    if (!text) {
      return {
        status: 400,
        body: {
          status: 400,
          title: 'Some details need fixing.',
          errors: { text: ['Write a message for Giddy.'] },
        },
      };
    }
    const message: SeedMessage = {
      id: id(),
      author: 'parent',
      text,
      sentAt: new Date().toISOString(),
      steps: [],
      suggestions: [],
      proposal: null,
    };
    this.messages.push(message);
    const turn: FakeTurn = {
      id: id(),
      script: this.script.shift() ?? FakePlanner.planTurn(),
      startedAt: Date.now(),
      status: 'running',
    };
    this.turns.set(turn.id, turn);
    return { status: 202, body: { messageId: message.id, turnId: turn.id } };
  }

  view() {
    const running = [...this.turns.values()].find(
      (t) => t.status === 'running' && (this.events(t), t.status === 'running'),
    );
    return {
      id: this.conversationId,
      party: this.glance,
      messages: this.messages,
      memories: this.memories,
      runningTurnId: running?.id ?? null,
    };
  }

  private giddy(text: string, extra: Partial<SeedMessage> = {}): SeedMessage {
    return {
      id: id(),
      author: 'giddy',
      text,
      sentAt: new Date().toISOString(),
      steps: [],
      suggestions: [],
      proposal: null,
      ...extra,
    };
  }

  /** The turn's events as of now; finishing the turn appends Giddy's message once. */
  private events(turn: FakeTurn) {
    const now = turn.cancelledAt ?? Date.now();
    const elapsed = now - turn.startedAt;
    const events: {
      sequence: number;
      type: string;
      stepId: string | null;
      text: string | null;
      messageId: string | null;
    }[] = [];
    const push = (
      type: string,
      stepId: string | null,
      text: string | null,
      messageId: string | null = null,
    ) => events.push({ sequence: events.length + 1, type, stepId, text, messageId });
    const done: string[] = [];
    turn.script.steps.forEach((step, i) => {
      if (elapsed >= i * turn.script.stepMs)
        push(
          'step.started',
          `step-${i}`,
          step.replace(
            /^(Checked|Compared|Found)/,
            (w) => ({ Checked: 'Checking', Compared: 'Comparing', Found: 'Finding' })[w] ?? w,
          ) + '…',
        );
      if (elapsed >= (i + 1) * turn.script.stepMs) {
        push('step.done', `step-${i}`, step);
        done.push(step);
      }
    });
    const allDone = elapsed >= turn.script.steps.length * turn.script.stepMs;
    if (turn.cancelledAt) {
      if (!turn.finished) {
        turn.finished = true;
        turn.status = 'cancelled';
        if (done.length)
          this.messages.push(
            this.giddy('You stopped Giddy.', { steps: done.map((text) => ({ text, done: true })) }),
          );
      }
      push('turn.cancelled', null, null);
    } else if (allDone && turn.script.outcome === 'fail') {
      turn.status = 'failed';
      push(
        'turn.failed',
        null,
        'Giddy can’t answer right now. Your message is saved; try again in a minute.',
      );
    } else if (allDone && turn.script.outcome === 'reply') {
      if (!turn.finished) {
        turn.finished = true;
        turn.status = 'completed';
        const reply = turn.script.reply!;
        this.messages.push(
          this.giddy(reply.text, {
            id: `${turn.id}-reply`,
            steps: done.map((text) => ({ text, done: true })),
            suggestions: reply.suggestions ?? [],
            proposal: reply.proposal ?? null,
          }),
        );
      }
      push('reply.done', null, null, `${turn.id}-reply`);
    }
    return events;
  }
}
