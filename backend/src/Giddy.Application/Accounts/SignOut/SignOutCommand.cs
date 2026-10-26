using MediatR;

namespace Giddy.Application.Accounts.SignOut;

public sealed record SignOutCommand(Guid SessionId) : IRequest;
