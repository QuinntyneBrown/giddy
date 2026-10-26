using Giddy.Application.Budget.Track;
using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Budget.Costs;

/// <summary>"Fill in from the plan": Giddy's typical GTA costs for a party with none yet.</summary>
public sealed record EstimateBudgetCommand(Guid PartyId) : IRequest<BudgetView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
