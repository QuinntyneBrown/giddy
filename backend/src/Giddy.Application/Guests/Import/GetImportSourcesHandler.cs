using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Guests.Import;

/// <summary>The parent's other parties that have guests to reuse, most recent first.</summary>
public sealed class GetImportSourcesHandler(IGiddyDbContext db, ICurrentParent parent) : IRequestHandler<GetImportSourcesQuery, IReadOnlyList<ImportSource>>
{
    public async Task<IReadOnlyList<ImportSource>> Handle(GetImportSourcesQuery request, CancellationToken cancellationToken)
    {
        var parties = await db.Parties
            .Where(p => p.Id != request.PartyId && p.Members.Any(m => m.ParentId == parent.Id))
            .ToListAsync(cancellationToken);
        var ids = parties.Select(p => p.Id).ToList();
        var counts = await db.Guests.Where(g => ids.Contains(g.PartyId)).GroupBy(g => g.PartyId)
            .Select(g => new { g.Key, Count = g.Count() }).ToDictionaryAsync(g => g.Key, g => g.Count, cancellationToken);
        return parties
            .Where(p => counts.ContainsKey(p.Id))
            .OrderByDescending(p => p.Date)
            .Select(p => new ImportSource(p.Id, p.Name, Parties.PartySummaryMapper.DatePattern.Format(p.Date), counts[p.Id]))
            .ToList();
    }
}
