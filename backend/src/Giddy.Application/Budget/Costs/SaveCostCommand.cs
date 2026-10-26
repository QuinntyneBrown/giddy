using Giddy.Application.Budget.Track;
using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Budget.Costs;

/// <param name="CostId">Null to add a cost; the cost's id to change it.</param>
public sealed record SaveCostCommand(Guid PartyId, Guid? CostId, string Description, string Category, decimal Amount, bool Paid)
    : IRequest<BudgetLine>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
