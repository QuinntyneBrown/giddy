namespace Giddy.Application.Guests.Import;

/// <summary>
/// Reads the cell values of a .csv or .xlsx file, never evaluating formulas or running macros.
/// Throws <see cref="UnreadableSpreadsheetException"/> for anything else.
/// </summary>
public interface ISpreadsheetReader
{
    IReadOnlyList<IReadOnlyList<string>> Read(Stream content, string fileName);
}
