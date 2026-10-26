using Giddy.Application.Common;
using Giddy.Domain.Parents;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Accounts.Verify;

/// <summary>Says nothing about whether the address has an account; just doesn't send to one that hasn't.</summary>
public sealed class ResendVerificationHandler(IGiddyDbContext db, AccountTokens tokens, AccountEmails emails, IClock clock)
    : IRequestHandler<ResendVerificationCommand>
{
    private static readonly Duration Wait = Duration.FromMinutes(1);

    public async Task Handle(ResendVerificationCommand request, CancellationToken cancellationToken)
    {
        var email = EmailAddresses.Normalize(request.Email);
        var parent = await db.Parents.SingleOrDefaultAsync(p => p.Email == email, cancellationToken);
        if (parent is null || parent.EmailVerified)
        {
            return;
        }

        var now = clock.GetCurrentInstant();
        var last = await db.AccountTokens
            .Where(t => t.ParentId == parent.Id && t.Purpose == AccountTokenPurpose.VerifyEmail)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => (Instant?)t.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (last is { } sent && now - sent < Wait)
        {
            var seconds = (int)Math.Ceiling((Wait - (now - sent)).TotalSeconds);
            throw new TooSoonException($"You can send another link in {seconds} seconds", seconds);
        }

        var token = tokens.Issue(parent.Id, AccountTokenPurpose.VerifyEmail);
        await db.SaveChangesAsync(cancellationToken);
        await emails.ConfirmAsync(parent, token, cancellationToken);
    }
}
