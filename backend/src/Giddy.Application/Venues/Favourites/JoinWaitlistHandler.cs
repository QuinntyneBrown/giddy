using Giddy.Application.Common;
using Giddy.Domain.Catalogue;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;

namespace Giddy.Application.Venues.Favourites;

public sealed class JoinWaitlistHandler(IGiddyDbContext db, ICurrentParent parent, IClock clock) : IRequestHandler<JoinWaitlistCommand>
{
    public async Task Handle(JoinWaitlistCommand request, CancellationToken cancellationToken)
    {
        if (!await db.CatalogueItems.AnyAsync(i => i.Id == request.VenueId && i.Category == CatalogueCategory.Venue, cancellationToken))
        {
            throw new NotFoundException("Venue not found.");
        }

        if (request.PartyId is { } partyId && !await db.Parties.AnyAsync(p => p.Id == partyId && p.Members.Any(m => m.ParentId == parent.Id), cancellationToken))
        {
            throw new NotFoundException("Party not found.");
        }

        var date = LocalDatePattern.Iso.Parse(request.Date).Value;
        if (!await db.VenueWaitlist.AnyAsync(w => w.FamilyId == parent.Id && w.VenueId == request.VenueId && w.Date == date, cancellationToken))
        {
            db.VenueWaitlist.Add(new VenueWaitlistEntry(Guid.NewGuid(), parent.Id, request.VenueId, date, request.PartyId, clock.GetCurrentInstant()));
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
