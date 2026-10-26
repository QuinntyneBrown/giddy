using MediatR;

namespace Giddy.Application.Sharing;

/// <summary>Accepts an invitation, after signing in as anyone.</summary>
public sealed record JoinPartyCommand(string Token) : IRequest<Joined>;
