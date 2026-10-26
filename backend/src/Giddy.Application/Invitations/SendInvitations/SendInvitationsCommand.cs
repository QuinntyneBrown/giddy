using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Invitations.SendInvitations;

public sealed record SendInvitationsCommand(Guid PartyId) : IRequest<InvitationsSent>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
