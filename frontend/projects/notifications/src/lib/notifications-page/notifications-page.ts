import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { InboxItem, NOTIFICATIONS_API } from '@giddy/api';
import {
  ButtonComponent,
  CardComponent,
  EmptyStateComponent,
  IconComponent,
  NotificationComponent,
  SkeletonComponent,
} from '@giddy/components';
import { ResourceLoader, UnreadNotifications, formatRelativeTime } from '@giddy/core';
import { firstValueFrom } from 'rxjs';

/** The notification centre: new ones first, then earlier ones from the last 90 days. */
@Component({
  imports: [
    NgTemplateOutlet,
    RouterLink,
    ButtonComponent,
    CardComponent,
    EmptyStateComponent,
    IconComponent,
    NotificationComponent,
    SkeletonComponent,
  ],
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsPage {
  private readonly api = inject(NOTIFICATIONS_API);
  private readonly router = inject(Router);
  private readonly unread = inject(UnreadNotifications);
  protected readonly inbox = new ResourceLoader(
    () => this.api.inbox(),
    (inbox) => inbox.items.length === 0,
  );
  protected readonly fresh = computed(() => this.inbox.value()?.items.filter((i) => !i.read) ?? []);
  protected readonly earlier = computed(
    () => this.inbox.value()?.items.filter((i) => i.read) ?? [],
  );
  protected readonly subtitle = computed(() => {
    const count = this.fresh().length;
    return count ? `${count} unread` : 'You’re all caught up';
  });

  protected when(item: InboxItem): string {
    return formatRelativeTime(item.createdAt);
  }

  protected async open(event: Event, item: InboxItem): Promise<void> {
    event.preventDefault();
    if (!item.read) {
      try {
        this.unread.set((await firstValueFrom(this.api.markRead(item.id))).unread);
      } catch {
        // Opening the page matters more than the read mark.
      }
    }
    await this.router.navigateByUrl(item.link);
  }

  protected async markAll(): Promise<void> {
    this.unread.set((await firstValueFrom(this.api.markAllRead())).unread);
    this.inbox.reload();
  }
}
