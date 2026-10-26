using MediatR;

namespace Giddy.Application.Accounts.Verify;

/// <summary>Opens a confirmation link, signing the parent in on this browser.</summary>
public sealed record VerifyEmailCommand(string Token, string Device) : IRequest<SignedIn>;
