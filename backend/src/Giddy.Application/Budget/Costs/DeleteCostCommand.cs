using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Budget.Costs;

public sealed record DeleteCostCommand(Guid PartyId, Guid CostId) : IRequest, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
