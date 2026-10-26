using MediatR;

namespace Giddy.Application.Accounts.Reset;

public sealed record ForgotPasswordCommand(string Email) : IRequest;
