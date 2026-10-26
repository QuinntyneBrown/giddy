using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Sharing;

public sealed record CreateShareLinkCommand(Guid PartyId) : IRequest<ShareLink>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
