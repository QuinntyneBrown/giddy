using Giddy.Domain.Parties;

namespace Giddy.Application.Sharing;

/// <summary>An invitation not yet accepted.</summary>
public sealed record InvitedView(string Email, PartyRole Role);
