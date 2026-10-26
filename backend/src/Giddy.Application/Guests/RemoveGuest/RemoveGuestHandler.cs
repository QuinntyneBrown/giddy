using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Guests.RemoveGuest;

/// <summary>Soft-deletes the guest so Undo can restore them and their reply for ten minutes.</summary>
public sealed class RemoveGuestHandler(IGiddyDbContext db, IClock clock) : IRequestHandler<RemoveGuestCommand>
{
    public async Task Handle(RemoveGuestCommand request, CancellationToken cancellationToken)
    {
        var guest = await db.Guests.SingleOrDefaultAsync(g => g.Id == request.GuestId && g.PartyId == request.PartyId, cancellationToken)
            ?? throw new NotFoundException("Guest not found.");
        guest.Remove(clock.GetCurrentInstant());
        await db.SaveChangesAsync(cancellationToken);
    }
}
