using FluentValidation;
using Giddy.Application.Accounts;
using Giddy.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Privacy;

public sealed class DeleteAccountValidator : AbstractValidator<DeleteAccountCommand>
{
    public DeleteAccountValidator(IGiddyDbContext db, ICurrentParent current) =>
        RuleFor(c => c.Email).CustomAsync(async (typed, context, cancellationToken) =>
        {
            var email = await db.Parents.Where(p => p.Id == current.Id).Select(p => p.Email).SingleOrDefaultAsync(cancellationToken) ?? current.Email;
            if (EmailAddresses.Normalize(typed) != email)
            {
                context.AddFailure($"Type the email you sign in with, {email}");
            }
        });
}
