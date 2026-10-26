using Giddy.Application.Accounts.Sessions;
using Giddy.Application.Common;
using Giddy.Domain.Parents;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Accounts.SignIn;

/// <summary>
/// Checks the password, pausing sign-in for 15 minutes after five failures in 15 minutes, and
/// emails the parent when a device they haven't used before signs in.
/// </summary>
public sealed class SignInHandler(
    IGiddyDbContext db, IPasswords passwords, ParentSessions sessions, AccountEmails emails, IClock clock)
    : IRequestHandler<SignInCommand, SignedIn>
{
    public async Task<SignedIn> Handle(SignInCommand request, CancellationToken cancellationToken)
    {
        var now = clock.GetCurrentInstant();
        var email = EmailAddresses.Normalize(request.Email);
        var parent = await db.Parents.SingleOrDefaultAsync(p => p.Email == email, cancellationToken);
        if (parent is null)
        {
            // The same work as a real check, so timing doesn't reveal which addresses have accounts.
            passwords.Verify(Parent.SignUp(Guid.Empty, string.Empty, email, false), request.Password);
            throw new WrongCredentialsException();
        }

        if (parent.IsSignInPausedAt(now) || parent.PauseIfTooManyFailures(now))
        {
            await db.SaveChangesAsync(cancellationToken);
            throw new SignInPausedException();
        }

        if (parent.PasswordHash is null || !passwords.Verify(parent, request.Password))
        {
            parent.RecordFailedSignIn(now);
            await db.SaveChangesAsync(cancellationToken);
            throw new WrongCredentialsException();
        }

        parent.ClearSignInFailures();
        var newDevice = parent.RememberDevice(request.Device);
        var signedIn = sessions.Start(parent, request.KeepSignedIn, request.Device);
        await db.SaveChangesAsync(cancellationToken);
        if (newDevice)
        {
            await emails.NewDeviceAsync(parent, request.Device, request.Location, cancellationToken);
        }

        return signedIn;
    }
}
