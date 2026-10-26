using Giddy.Application.Budget.Track;
using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Budget.Swaps;

public sealed record ApplySwapCommand(Guid PartyId, string Category, Guid ReplacementId) : IRequest<BudgetView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
