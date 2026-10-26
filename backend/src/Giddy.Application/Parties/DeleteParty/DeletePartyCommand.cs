using MediatR;

namespace Giddy.Application.Parties.DeleteParty;

public sealed record DeletePartyCommand(Guid PartyId) : IRequest, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Own;
}
