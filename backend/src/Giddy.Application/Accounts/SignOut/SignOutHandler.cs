using Giddy.Application.Accounts.Sessions;
using MediatR;

namespace Giddy.Application.Accounts.SignOut;

public sealed class SignOutHandler(ParentSessions sessions) : IRequestHandler<SignOutCommand>
{
    public Task Handle(SignOutCommand request, CancellationToken cancellationToken) =>
        sessions.EndAsync(request.SessionId, cancellationToken);
}
