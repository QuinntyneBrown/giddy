using Giddy.Application.Common;
using Giddy.Domain.Parents;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Accounts.Reset;

public sealed class CheckResetLinkHandler(IGiddyDbContext db, AccountTokens tokens, IClock clock) : IRequestHandler<CheckResetLinkQuery, ResetLink>
{
    public async Task<ResetLink> Handle(CheckResetLinkQuery request, CancellationToken cancellationToken)
    {
        var token = await tokens.FindAsync(request.Token, AccountTokenPurpose.ResetPassword, cancellationToken);
        if (token is null || !token.IsUsableAt(clock.GetCurrentInstant()))
        {
            throw new LinkExpiredException("This link has expired", null);
        }

        return new ResetLink(await db.Parents.Where(p => p.Id == token.ParentId).Select(p => p.Email).SingleAsync(cancellationToken));
    }
}
