using Giddy.Application.Venues;
using Giddy.Domain.Catalogue;
using NodaTime;

namespace Giddy.Infrastructure.Agent;

/// <summary>
/// Availability from the slots venues share with Giddy. Partner APIs plug in here later; callers
/// already handle <see cref="AvailabilityUnavailableException"/> when a partner times out.
/// </summary>
public sealed class CatalogueVenueAvailability : IVenueAvailability
{
    public Task<IReadOnlyDictionary<Guid, IReadOnlyList<VenueSlot>>> FreeSlotsAsync(
        IReadOnlyCollection<CatalogueItem> venues, LocalDate date, CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyDictionary<Guid, IReadOnlyList<VenueSlot>>>(
            venues.ToDictionary(v => v.Id, v => v.FreeSlotsOn(date)));
}
