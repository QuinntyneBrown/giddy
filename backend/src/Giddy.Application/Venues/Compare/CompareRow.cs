namespace Giddy.Application.Venues.Compare;

public sealed record CompareRow(string Label, IReadOnlyList<CompareCell> Cells);
