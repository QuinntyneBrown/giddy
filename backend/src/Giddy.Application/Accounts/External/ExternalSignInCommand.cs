using MediatR;

namespace Giddy.Application.Accounts.External;

/// <summary>A parent back from Google or Apple with the email the provider vouched for.</summary>
public sealed record ExternalSignInCommand(string Provider, string Email, string Name, bool EmailVerified, string Device) : IRequest<SignedIn>;
