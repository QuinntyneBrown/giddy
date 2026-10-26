using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Budget.Track;

public sealed record GetBudgetQuery(Guid PartyId) : IRequest<BudgetView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
