namespace Giddy.Application.Guests.Import;

/// <param name="Ready">Rows that will become guests.</param>
public sealed record ImportPreview(string FileName, int Rows, int Ready, IReadOnlyList<RowNote> MissingEmail, IReadOnlyList<RowNote> Duplicates);
