using Giddy.Application.Budget.Track;
using Giddy.Application.Common;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Budget.Costs;

public sealed class SaveCostHandler(IGiddyDbContext db) : IRequestHandler<SaveCostCommand, BudgetLine>
{
    public async Task<BudgetLine> Handle(SaveCostCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var cost = new Expense(request.CostId ?? Guid.NewGuid(), request.Description.Trim(), request.Category, request.Amount, request.Paid);
        if (request.CostId is null)
        {
            party.AddExpense(cost);
        }
        else if (!party.UpdateExpense(cost))
        {
            throw new NotFoundException("Cost not found.");
        }

        await db.SaveChangesAsync(cancellationToken);
        return new BudgetLine(cost.CostId.ToString(), "expense", cost.Category, cost.Description, cost.Paid ? "paid" : "estimate", cost.Amount, cost.Paid ? cost.Amount : 0);
    }
}
