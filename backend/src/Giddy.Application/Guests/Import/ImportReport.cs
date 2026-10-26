namespace Giddy.Application.Guests.Import;

public sealed record ImportReport(int Imported, IReadOnlyList<RowNote> Skipped);
