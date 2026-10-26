using Giddy.Application.Common;
using Giddy.Application.Parties;
using Giddy.Application.Venues.Search;
using Giddy.Domain.Catalogue;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Venues.Detail;

/// <summary>
/// A venue with its slots on a date. When the date is fully booked, it offers the nearest free date
/// here and the closest similar venue that is free.
/// </summary>
public sealed class GetVenueHandler(IGiddyDbContext db, ICurrentParent parent, VenueOrigins origins, VenueCandidates candidates)
    : IRequestHandler<GetVenueQuery, VenueDetail>
{
    private const int LookAheadDays = 60;

    public async Task<VenueDetail> Handle(GetVenueQuery request, CancellationToken cancellationToken)
    {
        var venue = await db.CatalogueItems.SingleOrDefaultAsync(i => i.Id == request.VenueId && i.Category == CatalogueCategory.Venue, cancellationToken)
            ?? throw new NotFoundException("Venue not found.");
        var profile = venue.Venue ?? throw new NotFoundException("Venue not found.");
        var date = LocalDatePattern.Iso.Parse(request.Date).Value;
        var origin = await origins.ResolveAsync(request.PartyId, null, cancellationToken);
        var distance = origin is null ? (double?)null : Math.Round(Distance.Kilometres(origin.Area.Latitude, origin.Area.Longitude, venue.Latitude, venue.Longitude), 1);
        var free = venue.FreeSlotsOn(date);
        var slots = profile.Slots
            .Select(s => new VenueSlotState(SearchVenuesHandler.Slot(s).Start, SearchVenuesHandler.Slot(s).End, !free.Contains(s)))
            .ToList();

        FreeDate? nearest = null;
        SimilarVenue? similar = null;
        if (free.Count == 0)
        {
            for (var day = 1; day <= LookAheadDays && nearest is null; day++)
            {
                foreach (var candidate in new[] { date.PlusDays(day), date.PlusDays(-day) })
                {
                    var open = venue.FreeSlotsOn(candidate);
                    if (open.Count > 0 && nearest is null)
                    {
                        var slot = SearchVenuesHandler.Slot(open[0]);
                        nearest = new FreeDate(PartySummaryMapper.DatePattern.Format(candidate), slot.Start, slot.End);
                    }
                }
            }

            if (origin is not null)
            {
                var guests = origin.Party?.GuestCount ?? venue.Capacity ?? 1;
                var others = await candidates.FindAsync(origin.Area, date, guests, origin.Area.SearchRadiusKm, cancellationToken);
                var pick = others.Where(c => c.Venue.Id != venue.Id && (c.Venue.Capacity ?? guests) >= guests).OrderBy(c => c.DistanceKm).FirstOrDefault();
                if (pick is not null)
                {
                    similar = new SimilarVenue(pick.Venue.Id, pick.Venue.Name, pick.DistanceKm, pick.Venue.Price, SearchVenuesHandler.Slot(pick.FreeSlots[0]).Start);
                }
            }
        }

        var favourite = await db.FavouriteVenues.AnyAsync(f => f.FamilyId == parent.Id && f.VenueId == venue.Id, cancellationToken);
        return new VenueDetail(
            venue.Id,
            venue.Name,
            profile.Emoji,
            profile.PhotoDescription,
            profile.Rating,
            profile.ReviewCount,
            profile.Address,
            venue.Neighbourhood,
            distance,
            venue.Description,
            VenueFeatures.Display(venue),
            venue.Price,
            profile.DurationMinutes,
            venue.Capacity ?? 0,
            profile.Includes,
            profile.AddOns,
            profile.Reviews,
            request.Date,
            slots,
            slots.FirstOrDefault(s => !s.Booked)?.Start,
            free.Count == 0,
            nearest,
            similar,
            favourite);
    }
}
