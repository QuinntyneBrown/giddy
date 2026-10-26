using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Budget.Costs;

public sealed class DeleteCostHandler(IGiddyDbContext db) : IRequestHandler<DeleteCostCommand>
{
    public async Task Handle(DeleteCostCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        if (!party.RemoveExpense(request.CostId))
        {
            throw new NotFoundException("Cost not found.");
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
