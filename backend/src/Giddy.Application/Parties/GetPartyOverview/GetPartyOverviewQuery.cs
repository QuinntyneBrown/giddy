using MediatR;

namespace Giddy.Application.Parties.GetPartyOverview;

public sealed record GetPartyOverviewQuery(Guid PartyId) : IRequest<PartyOverview>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
