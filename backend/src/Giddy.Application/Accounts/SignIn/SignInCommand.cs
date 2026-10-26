using MediatR;

namespace Giddy.Application.Accounts.SignIn;

/// <param name="Device">Such as "Safari on iPhone", from the browser.</param>
/// <param name="Location">Roughly where the sign-in came from, for the new-device email.</param>
public sealed record SignInCommand(string Email, string Password, bool KeepSignedIn, string Device, string Location) : IRequest<SignedIn>;
