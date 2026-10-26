import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SHARING_API } from '@giddy/api';
import { ButtonComponent, ErrorPageComponent, SpinnerComponent } from '@giddy/components';
import { firstValueFrom } from 'rxjs';

/** Accepts an invitation to plan a party, after signing in, and opens the party. */
@Component({
  imports: [RouterLink, ButtonComponent, ErrorPageComponent, SpinnerComponent],
  templateUrl: './join-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinPage {
  private readonly api = inject(SHARING_API);
  private readonly router = inject(Router);
  readonly token = input.required<string>();
  protected readonly expired = signal(false);

  constructor() {
    effect(() => {
      const token = this.token();
      untracked(() => void this.join(token));
    });
  }

  private async join(token: string): Promise<void> {
    try {
      const joined = await firstValueFrom(this.api.join(token));
      await this.router.navigateByUrl(`/parties/${joined.partyId}`, { replaceUrl: true });
    } catch {
      this.expired.set(true);
    }
  }
}
