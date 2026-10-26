import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  ApiProblem,
  GUESTS_API,
  ImportPreview,
  ImportReport,
  ImportSource,
  RowNote,
} from '@giddy/api';
import {
  AlertComponent,
  ButtonComponent,
  ChoiceComponent,
  DialogComponent,
  FileDropComponent,
  IconComponent,
  ProgressComponent,
} from '@giddy/components';
import { ResourceLoader, formatDate } from '@giddy/core';
import { firstValueFrom } from 'rxjs';
import { ImportGuestsData } from './import-guests-data';

const maximumBytes = 2 * 1024 * 1024;
const accepted = 'Choose a .csv or .xlsx file up to 2 MB.';

/**
 * Import a class list (.csv or .xlsx) or reuse another party's guests. The file is checked
 * first, so rows to fix and guests already on the list are named before anything is added.
 * Closes with the number imported.
 */
@Component({
  imports: [
    AlertComponent,
    ButtonComponent,
    ChoiceComponent,
    DialogComponent,
    FileDropComponent,
    IconComponent,
    ProgressComponent,
  ],
  templateUrl: './import-guests-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportGuestsDialog {
  private readonly api = inject(GUESTS_API);
  private readonly dialogRef = inject<DialogRef<number>>(DialogRef);
  protected readonly data = inject<ImportGuestsData>(DIALOG_DATA);
  protected readonly sources = new ResourceLoader(() => this.api.importSources(this.data.partyId));
  protected readonly source = signal<'spreadsheet' | string>('spreadsheet');
  protected readonly file = signal<File | null>(null);
  protected readonly preview = signal<ImportPreview | null>(null);
  protected readonly checking = signal(false);
  protected readonly progress = signal<number | null>(null);
  protected readonly report = signal<ImportReport | null>(null);
  protected readonly problem = signal<string | null>(null);
  /** The Contact Picker API; only some mobile browsers have it. */
  protected readonly contactsAvailable = false;

  protected readonly description = computed(
    () =>
      `Bring in ${this.data.childName ? this.data.childName + '’s' : 'the'} class list in one go. We’ll spot duplicates and ask parents for allergies when they RSVP.`,
  );
  protected readonly chosenParty = computed(
    () => (this.sources.value() ?? []).find((s) => s.partyId === this.source()) ?? null,
  );
  /** Guests the Import button will bring in; 0 keeps it disabled. */
  protected readonly ready = computed(() =>
    this.source() === 'spreadsheet'
      ? (this.preview()?.ready ?? 0)
      : (this.chosenParty()?.guests ?? 0),
  );
  protected readonly busy = computed(() => this.progress() !== null || this.checking());
  protected readonly fileDetail = computed(() => {
    const file = this.file();
    const preview = this.preview();
    if (!file) return null;
    const size = `${Math.max(1, Math.round(file.size / 1024))} KB`;
    return preview ? `${preview.rows} ${preview.rows === 1 ? 'row' : 'rows'} · ${size}` : size;
  });
  protected readonly missingHeading = computed(() => {
    const count = this.preview()?.missingEmail.length ?? 0;
    return `${count} ${count === 1 ? 'row needs' : 'rows need'} a parent email`;
  });
  protected readonly missingText = computed(() => {
    const rows = this.preview()?.missingEmail ?? [];
    const list = joinRows(rows);
    return rows.length === 1
      ? `Row ${list} has no email. Fix it in the file, or import the rest and add it later.`
      : `Rows ${list} have no email. Fix them in the file, or import the rest and add those later.`;
  });
  protected readonly duplicatesText = computed(() => {
    const rows = this.preview()?.duplicates ?? [];
    if (!rows.length) return null;
    const names = rows.map((r) => `${r.child} (row ${r.row})`).join(', ');
    return `${names} ${rows.length === 1 ? 'is' : 'are'} already on the list and will be skipped.`;
  });
  protected readonly reportText = computed(() => {
    const skipped = this.report()?.skipped ?? [];
    return skipped.length
      ? `Skipped ${skipped.length}: ${skipped.map((s) => `${s.child} (${s.reason.toLowerCase()})`).join(', ')}.`
      : 'Everyone in the list was added.';
  });
  protected readonly formatDate = formatDate;

  protected sourceDetail(source: ImportSource): string {
    return `Reuse ${source.guests} ${source.guests === 1 ? 'guest' : 'guests'} from ${formatDate(source.date, true)}`;
  }

  protected choose(source: string): void {
    this.source.set(source);
    this.problem.set(null);
  }

  protected async fileChosen(file: File): Promise<void> {
    this.file.set(file);
    this.preview.set(null);
    this.problem.set(null);
    if (!/\.(csv|xlsx)$/i.test(file.name) || file.size === 0 || file.size > maximumBytes) {
      this.problem.set(accepted);
      return;
    }

    this.checking.set(true);
    try {
      this.preview.set(await firstValueFrom(this.api.checkImport(this.data.partyId, file)));
    } catch (error) {
      this.fail(error);
    } finally {
      this.checking.set(false);
    }
  }

  protected async start(): Promise<void> {
    this.problem.set(null);
    this.progress.set(0);
    try {
      if (this.source() === 'spreadsheet') {
        await new Promise<void>((resolve, reject) =>
          this.api.importFile(this.data.partyId, this.file()!).subscribe({
            next: (event) =>
              event.kind === 'progress'
                ? this.progress.set(event.percent)
                : this.report.set(event.report),
            error: reject,
            complete: resolve,
          }),
        );
      } else {
        this.report.set(
          await firstValueFrom(this.api.importFromParty(this.data.partyId, this.source())),
        );
      }
    } catch (error) {
      this.fail(error);
    } finally {
      this.progress.set(null);
    }
  }

  protected close(): void {
    this.dialogRef.close(this.report()?.imported ?? 0);
  }

  private fail(error: unknown): void {
    const problem = error instanceof HttpErrorResponse ? (error.error as ApiProblem | null) : null;
    this.problem.set(
      error instanceof HttpErrorResponse && error.status === 400 && problem
        ? problem.title
        : 'The import didn’t go through, so nothing was added. Try again in a moment.',
    );
  }
}

function joinRows(rows: RowNote[]): string {
  const parts = rows.map((r) => `${r.row} (${r.child})`);
  return parts.length <= 1
    ? (parts[0] ?? '')
    : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
}
