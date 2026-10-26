using Giddy.Application.Common;
using Giddy.Domain.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;

namespace Giddy.Application.Notifications.Inbox;

/// <summary>The signed-in parent's own notifications, from the last 90 days.</summary>
public sealed class InboxHandlers(IGiddyDbContext db, ICurrentParent parent, IClock clock)
    : IRequestHandler<GetInboxQuery, InboxView>,
      IRequestHandler<GetUnreadCountQuery, UnreadCount>,
      IRequestHandler<MarkReadCommand, UnreadCount>
{
    public async Task<InboxView> Handle(GetInboxQuery request, CancellationToken cancellationToken)
    {
        var items = await Mine().ToListAsync(cancellationToken);
        return new InboxView(
            items.Count(i => i.ReadAt is null),
            items
                .OrderBy(i => i.ReadAt is null ? 0 : 1)
                .ThenByDescending(i => i.CreatedAt)
                .Select(i => new InboxItemView(i.Id, i.Icon, i.Title, i.Detail, i.Link, InstantPattern.General.Format(i.CreatedAt), i.ReadAt is not null))
                .ToList());
    }

    public async Task<UnreadCount> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken) =>
        new(await Mine().CountAsync(i => i.ReadAt == null, cancellationToken));

    public async Task<UnreadCount> Handle(MarkReadCommand request, CancellationToken cancellationToken)
    {
        var now = clock.GetCurrentInstant();
        var items = await Mine().Where(i => i.ReadAt == null && (request.ItemId == null || i.Id == request.ItemId)).ToListAsync(cancellationToken);
        if (request.ItemId is not null && items.Count == 0 && !await Mine().AnyAsync(i => i.Id == request.ItemId, cancellationToken))
        {
            throw new NotFoundException("Notification not found.");
        }

        items.ForEach(i => i.MarkRead(now));
        await db.SaveChangesAsync(cancellationToken);
        return new UnreadCount(await Mine().CountAsync(i => i.ReadAt == null, cancellationToken));
    }

    private IQueryable<InboxItem> Mine()
    {
        var since = clock.GetCurrentInstant() - InboxItem.Kept;
        return db.InboxItems.Where(i => i.ParentId == parent.Id && i.CreatedAt >= since);
    }
}
