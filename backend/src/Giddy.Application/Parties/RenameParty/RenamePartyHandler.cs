using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Parties.RenameParty;

public sealed class RenamePartyHandler(IGiddyDbContext db, ICurrentParent parent, PartySummaryMapper mapper)
    : IRequestHandler<RenamePartyCommand, PartySummary>
{
    public async Task<PartySummary> Handle(RenamePartyCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        party.Rename(request.Name);
        await db.SaveChangesAsync(cancellationToken);
        return mapper.Map(party, parent.Id);
    }
}
