using MediatR;

namespace Giddy.Application.Accounts.Reset;

public sealed record ResetPasswordCommand(string Token, string Password, string Confirm, string Device) : IRequest<SignedIn>;
