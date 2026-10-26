using Giddy.Application.Common;
using Giddy.Domain.Families;
using Giddy.Domain.Parents;
using Giddy.Domain.Places;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Accounts.SignUp;

/// <summary>
/// Creates an unverified account and its family, and emails a confirmation link. An address that
/// already has an account gets the same answer whether or not it is confirmed.
/// </summary>
public sealed class SignUpHandler(IGiddyDbContext db, IPasswords passwords, AccountTokens tokens, AccountEmails emails)
    : IRequestHandler<SignUpCommand, SignedUp>
{
    public async Task<SignedUp> Handle(SignUpCommand request, CancellationToken cancellationToken)
    {
        var email = EmailAddresses.Normalize(request.Email);
        var parent = Parent.SignUp(Guid.NewGuid(), request.FirstName.Trim(), email, request.Marketing);
        // Hashed before the lookup so an existing address takes as long as a new one.
        parent.SetPassword(passwords.Hash(parent, request.Password));
        if (await db.Parents.AnyAsync(p => p.Email == email, cancellationToken))
        {
            throw new ConflictException("There’s already a Giddy account for that email");
        }

        PostalCode.TryParse(request.PostalCode, out var postalCode);
        db.Parents.Add(parent);
        db.Families.Add(new Family(parent.Id, postalCode!.Value));
        var token = tokens.Issue(parent.Id, AccountTokenPurpose.VerifyEmail);
        await db.SaveChangesAsync(cancellationToken);
        await emails.ConfirmAsync(parent, token, cancellationToken);
        return new SignedUp(email);
    }
}
