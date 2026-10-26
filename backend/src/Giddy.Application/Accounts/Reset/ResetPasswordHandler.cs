using Giddy.Application.Accounts.Sessions;
using Giddy.Application.Common;
using Giddy.Domain.Parents;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Accounts.Reset;

/// <summary>Sets the new password, signs the parent in here and out everywhere else, and lifts any pause.</summary>
public sealed class ResetPasswordHandler(IGiddyDbContext db, IPasswords passwords, AccountTokens tokens, ParentSessions sessions, IClock clock)
    : IRequestHandler<ResetPasswordCommand, SignedIn>
{
    public async Task<SignedIn> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var now = clock.GetCurrentInstant();
        var token = await tokens.FindAsync(request.Token, AccountTokenPurpose.ResetPassword, cancellationToken);
        if (token is null || !token.IsUsableAt(now))
        {
            throw new LinkExpiredException("This link has expired", null);
        }

        var parent = await db.Parents.SingleAsync(p => p.Id == token.ParentId, cancellationToken);
        token.Use(now);
        parent.SetPassword(passwords.Hash(parent, request.Password));
        parent.ClearSignInFailures();
        // A reset proves the parent owns the address.
        parent.ConfirmEmail(now);
        await sessions.EndAllAsync(parent.Id, cancellationToken);
        parent.RememberDevice(request.Device);
        var signedIn = sessions.Start(parent, persistent: false, request.Device);
        await db.SaveChangesAsync(cancellationToken);
        return signedIn;
    }
}
