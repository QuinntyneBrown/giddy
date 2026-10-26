using Giddy.Application.Common;
using Giddy.Domain.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Notifications.Push;

/// <summary>Remembers the browsers a parent turned push on in, once each.</summary>
public sealed class PushSubscriptionHandlers(IGiddyDbContext db, ICurrentParent parent, IClock clock)
    : IRequestHandler<SavePushSubscriptionCommand>, IRequestHandler<RemovePushSubscriptionCommand>
{
    public async Task Handle(SavePushSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var existing = await db.PushSubscriptions.SingleOrDefaultAsync(s => s.Endpoint == request.Endpoint, cancellationToken);
        if (existing is not null)
        {
            db.PushSubscriptions.Remove(existing);
        }

        db.PushSubscriptions.Add(new PushSubscription(parent.Id, request.Endpoint, request.P256dh, request.Auth, clock.GetCurrentInstant()));
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task Handle(RemovePushSubscriptionCommand request, CancellationToken cancellationToken)
    {
        db.PushSubscriptions.RemoveRange(await db.PushSubscriptions.Where(s => s.Endpoint == request.Endpoint && s.ParentId == parent.Id).ToListAsync(cancellationToken));
        await db.SaveChangesAsync(cancellationToken);
    }
}
