using Giddy.Application.Venues;
using Giddy.Domain.Catalogue;
using NodaTime;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>A venue availability service that never answers in time.</summary>
public sealed class TimingOutAvailability : IVenueAvailability
{
    public Task<IReadOnlyDictionary<Guid, IReadOnlyList<VenueSlot>>> FreeSlotsAsync(
        IReadOnlyCollection<CatalogueItem> venues, LocalDate date, CancellationToken cancellationToken) =>
        throw new AvailabilityUnavailableException("Partner availability timed out.");
}
