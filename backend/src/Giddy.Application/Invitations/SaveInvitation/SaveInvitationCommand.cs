using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Invitations.SaveInvitation;

public sealed record SaveInvitationCommand(
    Guid PartyId, string Design, string Headline, string Message, string RsvpBy,
    bool AskAllergies, bool AskParentStaying, bool AskSiblings, bool ByEmail, bool ByText)
    : IRequest<InvitationView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
