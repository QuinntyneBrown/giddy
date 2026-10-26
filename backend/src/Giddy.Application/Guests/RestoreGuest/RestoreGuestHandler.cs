using Giddy.Application.Common;
using Giddy.Application.Guests.GetGuests;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Guests.RestoreGuest;

public sealed class RestoreGuestHandler(IGiddyDbContext db, IClock clock) : IRequestHandler<RestoreGuestCommand, GuestView>
{
    public async Task<GuestView> Handle(RestoreGuestCommand request, CancellationToken cancellationToken)
    {
        var guest = await db.Guests.IgnoreQueryFilters()
            .SingleOrDefaultAsync(g => g.Id == request.GuestId && g.PartyId == request.PartyId && g.RemovedAt != null, cancellationToken)
            ?? throw new NotFoundException("Guest not found.");
        if (clock.GetCurrentInstant() - guest.RemovedAt!.Value > RemovedGuests.UndoWindow)
        {
            throw new ConflictException("It’s too late to undo. Add the guest again.");
        }

        guest.Restore();
        await db.SaveChangesAsync(cancellationToken);
        return GuestViews.From(guest, planner: true);
    }
}
