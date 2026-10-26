using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Budget.Track;

public sealed class GetBudgetHandler(IGiddyDbContext db, BudgetProjection projection) : IRequestHandler<GetBudgetQuery, BudgetView>
{
    public async Task<BudgetView> Handle(GetBudgetQuery request, CancellationToken cancellationToken) =>
        await projection.ViewAsync(await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken), cancellationToken);
}
