using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Invitations.GetInvitation;

public sealed record GetInvitationQuery(Guid PartyId) : IRequest<InvitationView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
