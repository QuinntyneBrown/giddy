using Giddy.Application.Accounts.Sessions;
using Giddy.Application.Common;
using Giddy.Domain.Parents;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Accounts.Verify;

public sealed class VerifyEmailHandler(IGiddyDbContext db, AccountTokens tokens, ParentSessions sessions, IClock clock)
    : IRequestHandler<VerifyEmailCommand, SignedIn>
{
    public async Task<SignedIn> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var now = clock.GetCurrentInstant();
        var change = await tokens.FindAsync(request.Token, AccountTokenPurpose.ChangeEmail, cancellationToken);
        var token = change ?? await tokens.FindAsync(request.Token, AccountTokenPurpose.VerifyEmail, cancellationToken);
        var parent = token is null ? null : await db.Parents.SingleAsync(p => p.Id == token.ParentId, cancellationToken);
        if (token is null || parent is null || !token.IsUsableAt(now))
        {
            throw new LinkExpiredException("This confirmation link has expired", parent?.Email);
        }

        token.Use(now);
        if (change is not null)
        {
            parent.ConfirmEmailChange(now);
        }
        else
        {
            parent.ConfirmEmail(now);
        }

        parent.RememberDevice(request.Device);
        var signedIn = sessions.Start(parent, persistent: false, request.Device);
        await db.SaveChangesAsync(cancellationToken);
        return signedIn;
    }
}
