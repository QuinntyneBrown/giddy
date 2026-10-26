using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Checklist.View;

public sealed class GetChecklistHandler(IGiddyDbContext db, ChecklistProjection projection) : IRequestHandler<GetChecklistQuery, ChecklistView>
{
    public async Task<ChecklistView> Handle(GetChecklistQuery request, CancellationToken cancellationToken) =>
        await projection.ViewAsync(await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken), cancellationToken);
}
