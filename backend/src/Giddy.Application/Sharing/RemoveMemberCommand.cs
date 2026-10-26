using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Sharing;

public sealed record RemoveMemberCommand(Guid PartyId, Guid ParentId) : IRequest, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
