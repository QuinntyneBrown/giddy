using Giddy.Application.Common;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Venues.Search;

/// <summary>
/// Venues the party could use: in the GTA within the wider radius, serving the area, free on the
/// date for at least one slot, and holding at least nearly as many kids as invited.
/// </summary>
public sealed class VenueCandidates(IGiddyDbContext db, IVenueAvailability availability)
{
    /// <summary>Venues up to this many kids short are still shown, with a warning.</summary>
    public const int CloseFit = 2;

    public async Task<IReadOnlyList<VenueCandidate>> FindAsync(PartyArea area, LocalDate date, int guests, int maxRadiusKm, CancellationToken cancellationToken)
    {
        var venues = await db.CatalogueItems.Where(i => i.Category == CatalogueCategory.Venue).ToListAsync(cancellationToken);
        var nearby = venues
            .Where(v => v.Venue is not null && (v.Capacity ?? int.MaxValue) >= guests - CloseFit)
            .Select(v => (venue: v, distance: Distance.Kilometres(area.Latitude, area.Longitude, v.Latitude, v.Longitude)))
            .Where(x => x.distance <= maxRadiusKm && x.distance <= x.venue.ServiceRadiusKm)
            .ToList();
        var free = await availability.FreeSlotsAsync(nearby.Select(x => x.venue).ToList(), date, cancellationToken);
        return nearby
            .Where(x => free.TryGetValue(x.venue.Id, out var slots) && slots.Count > 0)
            .Select(x => new VenueCandidate(x.venue, Math.Round(x.distance, 1), free[x.venue.Id]))
            .ToList();
    }
}
