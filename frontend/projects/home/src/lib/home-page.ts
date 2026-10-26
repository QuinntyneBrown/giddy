import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SessionStore } from '@giddy/core';

@Component({
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly session = inject(SessionStore).session;
  protected readonly firstName = computed(() => this.session()?.name.split(' ')[0] ?? '');
}
