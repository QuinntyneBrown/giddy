namespace Giddy.Application.Guests.Import;

/// <param name="Row">The row number in the file, counting the header as row 1.</param>
public sealed record ImportRow(int Row, string Child, string Parent, string? Email, string? Mobile);
