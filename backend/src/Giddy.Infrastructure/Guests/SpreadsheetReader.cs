using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using Giddy.Application.Guests.Import;

namespace Giddy.Infrastructure.Guests;

/// <summary>
/// Reads .csv text and the first sheet of an .xlsx workbook as plain cell values. Formulas are
/// never evaluated (only their stored values are read) and macros are never loaded.
/// </summary>
public sealed class SpreadsheetReader : ISpreadsheetReader
{
    public IReadOnlyList<IReadOnlyList<string>> Read(Stream content, string fileName) =>
        Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".csv" => ReadCsv(content),
            ".xlsx" => ReadXlsx(content),
            _ => throw new UnreadableSpreadsheetException("Only .csv and .xlsx files can be read."),
        };

    private static IReadOnlyList<IReadOnlyList<string>> ReadCsv(Stream content)
    {
        using var reader = new StreamReader(content, Encoding.UTF8, detectEncodingFromByteOrderMarks: true);
        var text = reader.ReadToEnd();
        var rows = new List<IReadOnlyList<string>>();
        var row = new List<string>();
        var cell = new StringBuilder();
        var quoted = false;
        for (var i = 0; i < text.Length; i++)
        {
            var c = text[i];
            if (quoted)
            {
                if (c == '"' && i + 1 < text.Length && text[i + 1] == '"')
                {
                    cell.Append('"');
                    i++;
                }
                else if (c == '"')
                {
                    quoted = false;
                }
                else
                {
                    cell.Append(c);
                }
            }
            else if (c == '"')
            {
                quoted = true;
            }
            else if (c == ',')
            {
                row.Add(cell.ToString());
                cell.Clear();
            }
            else if (c is '\n' or '\r')
            {
                if (c == '\r' && i + 1 < text.Length && text[i + 1] == '\n')
                {
                    i++;
                }

                row.Add(cell.ToString());
                cell.Clear();
                rows.Add(row);
                row = [];
            }
            else
            {
                cell.Append(c);
            }
        }

        if (cell.Length > 0 || row.Count > 0)
        {
            row.Add(cell.ToString());
            rows.Add(row);
        }

        return rows;
    }

    private static IReadOnlyList<IReadOnlyList<string>> ReadXlsx(Stream content)
    {
        try
        {
            using var document = SpreadsheetDocument.Open(content, false, new OpenSettings { AutoSave = false });
            var workbook = document.WorkbookPart ?? throw new UnreadableSpreadsheetException("The workbook has no sheets.");
            var sheet = workbook.Workbook.Sheets?.Elements<Sheet>().FirstOrDefault() ?? throw new UnreadableSpreadsheetException("The workbook has no sheets.");
            var part = (WorksheetPart)workbook.GetPartById(sheet.Id!);
            var shared = workbook.SharedStringTablePart?.SharedStringTable.Elements<SharedStringItem>().Select(s => s.InnerText).ToList() ?? [];
            return part.Worksheet.Descendants<Row>()
                .Select(r => (IReadOnlyList<string>)r.Elements<Cell>().Select(cell => Value(cell, shared)).ToList())
                .ToList();
        }
        catch (Exception exception) when (exception is not UnreadableSpreadsheetException)
        {
            throw new UnreadableSpreadsheetException("The file isn’t a readable .xlsx workbook.");
        }
    }

    private static string Value(Cell cell, IReadOnlyList<string> shared)
    {
        if (cell.DataType?.Value == CellValues.InlineString)
        {
            return cell.InlineString?.InnerText ?? string.Empty;
        }

        var value = cell.CellValue?.Text ?? string.Empty;
        return cell.DataType?.Value == CellValues.SharedString && int.TryParse(value, out var index) && index < shared.Count
            ? shared[index]
            : value;
    }
}
