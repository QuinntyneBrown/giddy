using MediatR;

namespace Giddy.Application.Accounts.Verify;

/// <summary>Sends a fresh confirmation link, at most once a minute.</summary>
public sealed record ResendVerificationCommand(string Email) : IRequest;
