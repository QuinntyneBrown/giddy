import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { CONVERSATIONS_API, ChatMessage, Conversation, TurnEvent } from '@giddy/api';
import { ResourceLoader } from '@giddy/core';
import { Subscription, catchError, firstValueFrom, of, switchMap, takeWhile, timer } from 'rxjs';
import { ChatEntry } from './chat-entry';
import { RunningTurn } from './running-turn';

/** How often the page asks for Giddy's progress. */
export const turnPollMs = 500;

/**
 * The state of one conversation with Giddy: its messages, the turn in progress and its steps, and
 * any message that could not be sent. Provided per page.
 */
@Injectable()
export class PlannerConversation {
  private readonly api = inject(CONVERSATIONS_API);
  private polling?: Subscription;

  readonly loader = new ResourceLoader(() => this.api.current());
  private readonly local = signal<ChatEntry[]>([]);
  private readonly loaded = signal<Conversation | null>(null);
  readonly running = signal<RunningTurn | null>(null);
  /** Why Giddy's last turn failed, shown in the log. */
  readonly failure = signal<string | null>(null);

  readonly conversation = computed(() => this.loaded() ?? this.loader.value() ?? null);
  readonly entries = computed<ChatEntry[]>(() => [
    ...(this.conversation()?.messages ?? []).map((message) => ({
      message,
      status: 'sent' as const,
    })),
    ...this.local(),
  ]);
  readonly busy = computed(() => this.running() !== null);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.polling?.unsubscribe());
  }

  async send(text: string): Promise<void> {
    const conversation = this.conversation();
    if (!conversation || this.busy()) return;
    this.failure.set(null);
    const entry: ChatEntry = {
      status: 'sending',
      message: {
        id: `local-${Date.now()}`,
        author: 'parent',
        text,
        sentAt: new Date().toISOString(),
        steps: [],
        suggestions: [],
        proposal: null,
      },
    };
    this.local.update((entries) => [
      ...entries.filter((e) => e.message.text !== text || e.status !== 'failed'),
      entry,
    ]);
    try {
      const accepted = await firstValueFrom(this.api.send(conversation.id, text));
      this.local.update((entries) => entries.filter((e) => e !== entry));
      this.loaded.set({
        ...conversation,
        messages: [...conversation.messages, { ...entry.message, id: accepted.messageId }],
      });
      this.follow(conversation.id, accepted.turnId);
    } catch {
      this.local.update((entries) =>
        entries.map((e) => (e === entry ? { ...e, status: 'failed' } : e)),
      );
    }
  }

  /** Removes an unsent message so the parent can edit it, and returns its text. */
  takeBack(entry: ChatEntry): string {
    this.local.update((entries) => entries.filter((e) => e !== entry));
    return entry.message.text;
  }

  async stop(): Promise<void> {
    const conversation = this.conversation();
    const turn = this.running();
    if (!conversation || !turn) return;
    await firstValueFrom(
      this.api.cancel(conversation.id, turn.turnId).pipe(catchError(() => of(undefined))),
    );
    await this.finish();
  }

  async startNew(): Promise<void> {
    this.polling?.unsubscribe();
    this.running.set(null);
    this.failure.set(null);
    this.local.set([]);
    this.loaded.set(await firstValueFrom(this.api.start()));
  }

  /** Reloads the conversation, for example after a plan was saved. */
  async refresh(): Promise<void> {
    this.loaded.set(await firstValueFrom(this.api.current()));
  }

  /** Keeps following a turn that was running when the page loaded. */
  resume(conversation: Conversation): void {
    if (conversation.runningTurnId && !this.running())
      this.follow(conversation.id, conversation.runningTurnId);
  }

  private follow(conversationId: string, turnId: string): void {
    this.polling?.unsubscribe();
    this.running.set({ turnId, steps: [], after: 0 });
    this.polling = timer(0, turnPollMs)
      .pipe(
        switchMap(() =>
          this.api
            .turn(conversationId, turnId, this.running()?.after ?? 0)
            .pipe(catchError(() => of(null))),
        ),
        takeWhile((turn) => turn === null || turn.status === 'running', true),
      )
      .subscribe((turn) => {
        if (!turn) return;
        turn.events.forEach((event) => this.apply(event));
        if (turn.status !== 'running') void this.finish();
      });
  }

  private apply(event: TurnEvent): void {
    this.running.update((turn) => {
      if (!turn) return turn;
      const steps = [...turn.steps];
      if (event.type === 'step.started' && event.stepId) {
        steps.push({ id: event.stepId, text: event.text ?? '', done: false });
      } else if (event.type === 'step.done' && event.stepId) {
        const index = steps.findIndex((s) => s.id === event.stepId);
        const done = { id: event.stepId, text: event.text ?? '', done: true };
        if (index >= 0) steps[index] = done;
        else steps.push(done);
      } else if (event.type === 'turn.failed') {
        this.failure.set(event.text ?? 'Giddy can’t answer right now.');
      }
      return { ...turn, steps, after: Math.max(turn.after, event.sequence) };
    });
  }

  private async finish(): Promise<void> {
    this.polling?.unsubscribe();
    try {
      await this.refresh();
    } catch (error) {
      if (!(error instanceof HttpErrorResponse)) throw error;
    }
    this.running.set(null);
  }

  static isParent(message: ChatMessage): boolean {
    return message.author === 'parent';
  }
}
