import { DestroyRef, Signal, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblem } from '@giddy/api';
import { Observable, Subscription } from 'rxjs';
import { ResourceStatus } from './resource-status';

/** Skeletons appear only when data takes longer than this, so fast loads never flash. */
export const skeletonDelayMs = 300;

/**
 * Loads one page section and exposes its state: loading, ready, empty or error. Each section has
 * its own loader, so one failing section never takes down the rest of the page.
 */
export class ResourceLoader<T> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentStatus = signal<ResourceStatus>('loading');
  private readonly currentValue = signal<T | undefined>(undefined);
  private readonly currentProblem = signal<ApiProblem | null>(null);
  private readonly slow = signal(false);
  private subscription?: Subscription;
  private timer?: ReturnType<typeof setTimeout>;

  readonly status: Signal<ResourceStatus> = this.currentStatus.asReadonly();
  readonly value: Signal<T | undefined> = this.currentValue.asReadonly();
  readonly problem: Signal<ApiProblem | null> = this.currentProblem.asReadonly();
  readonly showSkeleton = computed(() => this.currentStatus() === 'loading' && this.slow());

  /**
   * @param autoLoad false when the source depends on route inputs: call reload() once they are set.
   */
  constructor(
    private readonly source: () => Observable<T>,
    private readonly isEmpty: (value: T) => boolean = () => false,
    autoLoad = true,
  ) {
    this.destroyRef.onDestroy(() => this.stop());
    if (autoLoad) this.reload();
  }

  reload(): void {
    this.stop();
    this.currentStatus.set('loading');
    this.currentProblem.set(null);
    this.slow.set(false);
    this.timer = setTimeout(() => this.slow.set(true), skeletonDelayMs);
    this.subscription = this.source().subscribe({
      next: (value) => {
        this.currentValue.set(value);
        this.currentStatus.set(this.isEmpty(value) ? 'empty' : 'ready');
        clearTimeout(this.timer);
      },
      error: (error: unknown) => {
        this.currentProblem.set(toProblem(error));
        this.currentStatus.set('error');
        clearTimeout(this.timer);
      },
    });
  }

  /** Shows a value changed on the device, such as a tick made offline, without loading. */
  update(value: T): void {
    this.currentValue.set(value);
    this.currentStatus.set(this.isEmpty(value) ? 'empty' : 'ready');
  }

  private stop(): void {
    clearTimeout(this.timer);
    this.subscription?.unsubscribe();
  }
}

function toProblem(error: unknown): ApiProblem {
  if (error instanceof HttpErrorResponse && error.error && typeof error.error === 'object') {
    return {
      status: error.status,
      title: 'Request failed',
      ...(error.error as Partial<ApiProblem>),
    };
  }
  return { status: error instanceof HttpErrorResponse ? error.status : 0, title: 'Request failed' };
}
