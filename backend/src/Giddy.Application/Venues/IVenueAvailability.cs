using Giddy.Domain.Catalogue;
using NodaTime;

namespace Giddy.Application.Venues;

/// <summary>
/// Live availability from venue partners. Throws <see cref="AvailabilityUnavailableException"/>
/// when partners do not answer in time.
/// </summary>
public interface IVenueAvailability
{
    Task<IReadOnlyDictionary<Guid, IReadOnlyList<VenueSlot>>> FreeSlotsAsync(
        IReadOnlyCollection<CatalogueItem> venues, LocalDate date, CancellationToken cancellationToken);
}
