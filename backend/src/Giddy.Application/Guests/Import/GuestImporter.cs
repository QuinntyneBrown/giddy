using Giddy.Application.Common;
using Giddy.Application.Guests.AddGuest;
using Giddy.Domain.Guests;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Guests.Import;

/// <summary>
/// Checks and imports rows: rows without a parent email, guests already on the list and rows past
/// the 60-guest limit are skipped, with why. Files are scanned and read in memory, never stored.
/// </summary>
public sealed class GuestImporter(IGiddyDbContext db, ISpreadsheetReader reader, IMalwareScanner scanner)
{
    public const int MaximumFileBytes = 2 * 1024 * 1024;
    private const string AcceptedFiles = "Choose a .csv or .xlsx file up to 2 MB.";

    public async Task<IReadOnlyList<ImportRow>> ReadAsync(ImportFile file, CancellationToken cancellationToken)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension is not (".csv" or ".xlsx") || file.Length == 0 || file.Length > MaximumFileBytes)
        {
            throw new InvalidImportFileException(AcceptedFiles);
        }

        using var content = new MemoryStream(file.Content, writable: false);
        if (!await scanner.IsCleanAsync(content, cancellationToken))
        {
            throw new InvalidImportFileException("This file can’t be imported because it may be unsafe.");
        }

        content.Position = 0;
        try
        {
            return ClassList.Rows(reader.Read(content, file.FileName));
        }
        catch (UnreadableSpreadsheetException)
        {
            throw new InvalidImportFileException(AcceptedFiles);
        }
    }

    public async Task<ImportPreview> PreviewAsync(Guid partyId, string fileName, IReadOnlyList<ImportRow> rows, CancellationToken cancellationToken)
    {
        var plan = await PlanAsync(partyId, rows, cancellationToken);
        return new ImportPreview(
            fileName,
            rows.Count,
            plan.Ready.Count,
            plan.Skipped.Where(s => s.Reason == NoEmail).ToList(),
            plan.Skipped.Where(s => s.Reason == AlreadyListed).ToList());
    }

    public async Task<ImportReport> ImportAsync(Guid partyId, IReadOnlyList<ImportRow> rows, CancellationToken cancellationToken)
    {
        var plan = await PlanAsync(partyId, rows, cancellationToken);
        db.Guests.AddRange(plan.Ready.Select(r => new Guest(Guid.NewGuid(), partyId, r.Child, r.Parent.Length > 0 ? r.Parent : "Parent", r.Email, r.Mobile)));
        await db.SaveChangesAsync(cancellationToken);
        return new ImportReport(plan.Ready.Count, plan.Skipped);
    }

    private const string NoEmail = "No parent email";
    private const string AlreadyListed = "Already on the list";
    private const string Full = "The list holds up to 60 guests";

    private async Task<(List<ImportRow> Ready, List<RowNote> Skipped)> PlanAsync(Guid partyId, IReadOnlyList<ImportRow> rows, CancellationToken cancellationToken)
    {
        var existing = await db.Guests.Where(g => g.PartyId == partyId).Select(g => new { g.ChildName, g.Email }).ToListAsync(cancellationToken);
        var keys = existing.Select(g => Key(g.ChildName, g.Email)).ToHashSet();
        var room = AddGuestHandler.MaximumGuests - existing.Count;
        var ready = new List<ImportRow>();
        var skipped = new List<RowNote>();
        foreach (var row in rows)
        {
            var reason = row.Email is null ? NoEmail
                : !keys.Add(Key(row.Child, row.Email)) ? AlreadyListed
                : ready.Count >= room ? Full
                : null;
            if (reason is null)
            {
                ready.Add(row);
            }
            else
            {
                skipped.Add(new RowNote(row.Row, row.Child, reason));
            }
        }

        return (ready, skipped.OrderBy(s => s.Reason == NoEmail).ThenBy(s => s.Row).ToList());
    }

    private static string Key(string child, string? email) => $"{child.Trim().ToLowerInvariant()}|{email?.Trim().ToLowerInvariant()}";
}
