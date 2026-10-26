namespace Giddy.Application.Guests.Import;

/// <summary>Turns spreadsheet rows into guests, finding the child, parent, email and mobile columns by their headers.</summary>
public static class ClassList
{
    private static readonly string[][] Headers =
    [
        ["child", "child name", "child’s name", "kid", "name"],
        ["parent", "parent name", "parent’s name", "guardian"],
        ["email", "parent email", "e-mail", "email address"],
        ["mobile", "phone", "mobile number", "parent mobile", "cell"],
    ];

    public static IReadOnlyList<ImportRow> Rows(IReadOnlyList<IReadOnlyList<string>> cells)
    {
        if (cells.Count == 0)
        {
            return [];
        }

        var header = cells[0].Select(h => h.Trim().ToLowerInvariant()).ToList();
        var columns = Headers.Select(names => header.FindIndex(names.Contains)).ToArray();
        if (columns[0] < 0)
        {
            columns = [0, 1, 2, 3];
        }

        string? Cell(IReadOnlyList<string> row, int column) =>
            column >= 0 && column < row.Count && !string.IsNullOrWhiteSpace(row[column]) ? row[column].Trim() : null;

        return cells.Skip(1)
            .Select((row, i) => (row, number: i + 2))
            .Where(x => x.row.Any(c => !string.IsNullOrWhiteSpace(c)))
            .Select(x => new ImportRow(x.number, Cell(x.row, columns[0]) ?? string.Empty, Cell(x.row, columns[1]) ?? string.Empty, Cell(x.row, columns[2]), Cell(x.row, columns[3])))
            .Where(r => r.Child.Length > 0)
            .ToList();
    }
}
