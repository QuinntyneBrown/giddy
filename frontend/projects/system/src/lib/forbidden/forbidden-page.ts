import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, ErrorPageComponent } from '@giddy/components';
import { SessionStore } from '@giddy/core';

@Component({
  imports: [RouterLink, ButtonComponent, ErrorPageComponent],
  templateUrl: './forbidden-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenPage {
  private readonly session = inject(SessionStore).session;

  protected readonly message = computed(() => {
    const email = this.session()?.email;
    const signedInAs = email ? `You’re signed in as ${email}, but this` : 'This';
    return `${signedInAs} plan wasn’t shared with you. Ask the parent who planned it to invite you as a co-planner.`;
  });
}
