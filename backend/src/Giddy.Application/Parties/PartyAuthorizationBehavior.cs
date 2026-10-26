using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Parties;

/// <summary>
/// Checks that the signed-in parent is a member of the party and that their role allows the
/// request. Parents who are not members get "not found" so they cannot learn the party exists.
/// </summary>
public sealed class PartyAuthorizationBehavior<TRequest, TResponse>(IGiddyDbContext db, ICurrentParent parent, TorontoCalendar calendar)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IPartyRequest
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var role = await db.Parties
            .Where(p => p.Id == request.PartyId)
            .SelectMany(p => p.Members)
            .Where(m => m.ParentId == parent.Id)
            .Select(m => (PartyRole?)m.Role)
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Party not found.");

        if (request.RequiredAccess == PartyAccess.Plan && !role.CanPlan())
        {
            throw new ForbiddenException("Viewers cannot change this party.");
        }

        if (request.RequiredAccess == PartyAccess.Own && role != PartyRole.Owner)
        {
            throw new ForbiddenException("Only the party's owner can do that.");
        }

        if (request.RequiredAccess == PartyAccess.Plan
            && await db.Parties.AnyAsync(p => p.Id == request.PartyId && p.Date < calendar.Today, cancellationToken))
        {
            throw new ConflictException("This party has happened, so its plan is read-only.");
        }

        return await next(cancellationToken);
    }
}
