using Giddy.Application.Bookings;
using Giddy.Application.Common;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Guests.ShareAllergyList;

/// <summary>Sends the booked venue each child's first name and allergy, and ticks the checklist task.</summary>
public sealed class ShareAllergyListHandler(IGiddyDbContext db, IVenuePartner partner, IClock clock)
    : IRequestHandler<ShareAllergyListCommand, AllergyListShared>
{
    public async Task<AllergyListShared> Handle(ShareAllergyListCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var venue = party.BookingsToDo.FirstOrDefault(b => b.Category == "Venue" && b.Status == BookingStatus.Confirmed)
            ?? throw new ConflictException("Book a venue first, then share the allergy list with it.");
        var guests = await db.Guests.Where(g => g.PartyId == party.Id).ToListAsync(cancellationToken);
        var entries = AllergyLists.For(guests);

        await partner.ShareAllergyListAsync(venue.Name, venue.CatalogueItemId, entries, cancellationToken);
        party.MarkAllergyListShared(clock.GetCurrentInstant());
        await db.SaveChangesAsync(cancellationToken);
        return new AllergyListShared(venue.Name, entries.Count);
    }
}
