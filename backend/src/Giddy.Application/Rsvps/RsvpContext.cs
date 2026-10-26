using Giddy.Domain.Guests;
using Giddy.Domain.Invitations;
using Giddy.Domain.Parties;

namespace Giddy.Application.Rsvps;

public sealed record RsvpContext(Guest Guest, Party Party, Invitation Invitation);
