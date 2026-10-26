using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Budget.Costs;

public sealed class DeleteCostHandler(Notifications.PlannerNews news, IGiddyDbContext db) : IRequestHandler<DeleteCostCommand>
{
    public async Task Handle(DeleteCostCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var removed = party.Expenses.SingleOrDefault(e => e.CostId == request.CostId);
        if (!party.RemoveExpense(request.CostId))
        {
            throw new NotFoundException("Cost not found.");
        }

        news.TellOthers(party, "💰", $"removed {removed!.Description} from the budget", $"The budget for {party.Name}.", $"/parties/{party.Id}/budget");
        await db.SaveChangesAsync(cancellationToken);
    }
}
