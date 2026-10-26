using Giddy.Application.Accounts.Sessions;
using Giddy.Application.Common;
using Giddy.Domain.Families;
using Giddy.Domain.Parents;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Accounts.External;

/// <summary>
/// Signs in the account with the provider's verified email, or creates a verified one. A provider
/// that hasn't verified the address can't sign in to an existing account.
/// </summary>
public sealed class ExternalSignInHandler(IGiddyDbContext db, ParentSessions sessions, IClock clock)
    : IRequestHandler<ExternalSignInCommand, SignedIn>
{
    public async Task<SignedIn> Handle(ExternalSignInCommand request, CancellationToken cancellationToken)
    {
        if (!request.EmailVerified)
        {
            throw new ForbiddenException("The provider didn’t confirm that email address.");
        }

        var now = clock.GetCurrentInstant();
        var email = EmailAddresses.Normalize(request.Email);
        var parent = await db.Parents.SingleOrDefaultAsync(p => p.Email == email, cancellationToken);
        var isNew = parent is null;
        if (parent is null)
        {
            var firstName = (request.Name.Trim().Split(' ').FirstOrDefault() is { Length: > 0 } first) ? first : email.Split('@')[0];
            parent = Parent.SignUp(Guid.NewGuid(), firstName, email, marketingOptIn: false);
            db.Parents.Add(parent);
            db.Families.Add(new Family(parent.Id, string.Empty));
        }

        parent.ConfirmEmail(now);
        parent.RememberDevice(request.Device);
        var signedIn = sessions.Start(parent, persistent: false, request.Device, isNew);
        await db.SaveChangesAsync(cancellationToken);
        return signedIn;
    }
}
