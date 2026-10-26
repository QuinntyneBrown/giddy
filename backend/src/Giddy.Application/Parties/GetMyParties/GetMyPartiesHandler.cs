using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Parties.GetMyParties;

public sealed class GetMyPartiesHandler(IGiddyDbContext db, ICurrentParent parent, PartySummaryMapper mapper)
    : IRequestHandler<GetMyPartiesQuery, IReadOnlyList<PartySummary>>
{
    public async Task<IReadOnlyList<PartySummary>> Handle(GetMyPartiesQuery request, CancellationToken cancellationToken)
    {
        var parties = await db.Parties
            .Where(p => p.Members.Any(m => m.ParentId == parent.Id))
            .ToListAsync(cancellationToken);

        return parties
            .OrderBy(p => p.Date)
            .ThenBy(p => p.StartsAt)
            .Select(p => mapper.Map(p, parent.Id))
            .ToList();
    }
}
