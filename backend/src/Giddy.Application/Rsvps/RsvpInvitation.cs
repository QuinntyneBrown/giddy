using Giddy.Application.Invitations;

namespace Giddy.Application.Rsvps;

public sealed record RsvpInvitation(string Design, string Headline, string Message, string RsvpBy, InvitationDetails Details);
