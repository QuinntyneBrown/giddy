using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Invitations.SendTest;

/// <summary>"Send me a test": the invitation goes only to the signed-in parent.</summary>
public sealed record SendTestInvitationCommand(Guid PartyId) : IRequest, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
