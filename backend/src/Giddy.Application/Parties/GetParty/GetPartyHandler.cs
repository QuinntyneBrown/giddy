using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Parties.GetParty;

public sealed class GetPartyHandler(IGiddyDbContext db, ICurrentParent parent, PartySummaryMapper mapper)
    : IRequestHandler<GetPartyQuery, PartySummary>
{
    public async Task<PartySummary> Handle(GetPartyQuery request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        return mapper.Map(party, parent.Id);
    }
}
