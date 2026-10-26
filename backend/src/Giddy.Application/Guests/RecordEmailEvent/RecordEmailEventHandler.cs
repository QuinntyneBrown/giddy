using Giddy.Application.Common;
using Giddy.Application.Live;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Guests.RecordEmailEvent;

/// <summary>Marks a bounced invitation and tells the host; events for unknown messages are ignored.</summary>
public sealed class RecordEmailEventHandler(IGiddyDbContext db, IClock clock) : IRequestHandler<RecordEmailEventCommand>
{
    public async Task Handle(RecordEmailEventCommand request, CancellationToken cancellationToken)
    {
        if (request.Type != "bounced" || !Guid.TryParse(request.Reference, out var guestId))
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
