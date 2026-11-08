import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

let nextId = 0;

/**
 * A short narrated clip with the browser's own controls: a poster, exactly one English captions
 * track that stays off until the viewer turns it on, and the projected transcript in a "Read the
 * transcript" disclosure. It never autoplays. When the browser cannot play the file, the poster
 * stays as a still, a status says so and the transcript opens.
 */
@Component({
  selector: 'figure[giddy-video]',
  templateUrl: './video.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'video' },
})
export class VideoComponent {
  readonly src = input.required<string>();
  readonly poster = input.required<string>();
  /** WebVTT captions in English; offered as a track that is off by default. */
  readonly captions = input<string | null>(null);
  /** Accessible name of the video, such as "Meet Giddy, a twenty-second tour". */
  readonly label = input.required<string>();
  /** Text alternative of the poster when it stands in for a video that cannot play. */
  readonly posterAlt = input.required<string>();

  protected readonly transcriptId = `giddy-video-transcript-${nextId++}`;
  protected readonly unavailable = signal(false);
  protected readonly transcriptOpen = signal(false);

  protected failed(): void {
    this.unavailable.set(true);
    this.transcriptOpen.set(true);
  }

  protected toggled(event: Event): void {
    this.transcriptOpen.set((event.target as HTMLDetailsElement).open);
  }
}
