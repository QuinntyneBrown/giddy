import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent, ErrorPageComponent } from '@giddy/components';

@Component({
  imports: [RouterLink, ButtonComponent, ErrorPageComponent],
  templateUrl: './not-found-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
