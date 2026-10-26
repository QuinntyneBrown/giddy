using MediatR;

namespace Giddy.Application.Parties.GetParty;

public sealed record GetPartyQuery(Guid PartyId) : IRequest<PartySummary>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
