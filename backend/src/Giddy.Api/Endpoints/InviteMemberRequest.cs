using Giddy.Domain.Parties;

namespace Giddy.Api.Endpoints;

public sealed record InviteMemberRequest(string? Email, PartyRole Role);
