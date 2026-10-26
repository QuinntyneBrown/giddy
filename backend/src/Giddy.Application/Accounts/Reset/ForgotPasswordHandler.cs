using Giddy.Application.Common;
using Giddy.Domain.Parents;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Accounts.Reset;

/// <summary>Emails a 30-minute reset link when the address has an account; answers the same either way.</summary>
public sealed class ForgotPasswordHandler(IGiddyDbContext db, AccountTokens tokens, AccountEmails emails) : IRequestHandler<ForgotPasswordCommand>
{
    public async Task Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var email = EmailAddresses.Normalize(request.Email);
        var parent = await db.Parents.SingleOrDefaultAsync(p => p.Email == email, cancellationToken);
        if (parent is null)
        {
            return;
        }

        var token = tokens.Issue(parent.Id, AccountTokenPurpose.ResetPassword);
        await emails.ResetAsync(parent, token, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
    }
}
