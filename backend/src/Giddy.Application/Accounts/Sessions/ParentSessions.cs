using Giddy.Application.Common;
using Giddy.Domain.Parents;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Accounts.Sessions;

/// <summary>Starts, checks and ends server-side sessions.</summary>
public sealed class ParentSessions(IGiddyDbContext db, IClock clock)
{
    public SignedIn Start(Parent parent, bool persistent, string device, bool isNew = false)
    {
        var session = new ParentSession(parent.Id, persistent, device, clock.GetCurrentInstant());
        db.ParentSessions.Add(session);
        return new SignedIn(parent.Id, parent.Name, parent.Email, parent.EmailVerified, session.Id, persistent, isNew);
    }

    /// <summary>The parent behind a live session, sliding it on; null when it has ended.</summary>
    public async Task<Parent?> ValidateAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var now = clock.GetCurrentInstant();
        var session = await db.ParentSessions.SingleOrDefaultAsync(s => s.Id == sessionId, cancellationToken);
        if (session is null || !session.IsActiveAt(now))
        {
            return null;
        }

        session.Touch(now);
        var parent = await db.Parents.SingleOrDefaultAsync(p => p.Id == session.ParentId, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        return parent;
    }

    public async Task EndAsync(Guid sessionId, CancellationToken cancellationToken)
    {
        var session = await db.ParentSessions.SingleOrDefaultAsync(s => s.Id == sessionId, cancellationToken);
        session?.Revoke(clock.GetCurrentInstant());
        await db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>Signs the parent out everywhere, for example after a password change.</summary>
    public async Task EndAllAsync(Guid parentId, CancellationToken cancellationToken)
    {
        var now = clock.GetCurrentInstant();
        foreach (var session in await db.ParentSessions.Where(s => s.ParentId == parentId && s.RevokedAt == null).ToListAsync(cancellationToken))
        {
            session.Revoke(now);
        }
    }
}
