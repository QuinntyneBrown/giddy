using Giddy.Application.Common;
using Giddy.Application.Live;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Guests.RecordEmailEvent;

/// <summary>
/// Marks a bounced invitation and tells the host, or a bounced account email; events for unknown
/// messages are ignored.
/// </summary>
public sealed class RecordEmailEventHandler(IGiddyDbContext db, IClock clock) : IRequestHandler<RecordEmailEventCommand>
{
    public async Task Handle(RecordEmailEventCommand request, CancellationToken cancellationToken)
    {
        if (request.Type != "bounced")
        {
            return;
        }

        // Account emails carry "parent:<id>": a bounced confirmation shows on the parent's session.
        if (request.Reference?.StartsWith("parent:", StringComparison.Ordinal) == true)
        {
            if (Guid.TryParse(request.Reference["parent:".Length..], out var parentId)
                && await db.Parents.SingleOrDefaultAsync(p => p.Id == parentId, cancellationToken) is { } parent)
            {
                parent.MarkEmailBounced();
                await db.SaveChangesAsync(cancellationToken);
            }

            return;
        }

        if (!Guid.TryParse(request.Reference, out var guestId))
        {
            return;
        }

        var guest = await db.Guests.SingleOrDefaultAsync(g => g.Id == guestId, cancellationToken);
        if (guest is null || guest.EmailBounced)
        {
            return;
        }

        guest.Bounce();
        db.PartyEvents.Add(PartyEvents.Bounced(guest, clock.GetCurrentInstant()));
        await db.SaveChangesAsync(cancellationToken);
    }
}
