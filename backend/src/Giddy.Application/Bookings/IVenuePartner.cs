using Giddy.Domain.Catalogue;
using NodaTime;

namespace Giddy.Application.Bookings;

/// <summary>
/// The venue partner's booking API: hold a slot, then confirm or release it. Throws
/// <see cref="SlotTakenException"/> when someone else has the slot and
/// <see cref="VenueDidNotConfirmException"/> when the venue does not answer in time.
/// </summary>
public interface IVenuePartner
{
    Task<VenueHold> HoldAsync(CatalogueItem venue, LocalDate date, VenueSlot slot, CancellationToken cancellationToken);

    /// <returns>The venue's confirmation number, for example "DD-48213".</returns>
    Task<string> ConfirmAsync(VenueHold hold, BookingContact contact, CancellationToken cancellationToken);

    Task ReleaseAsync(VenueHold hold, CancellationToken cancellationToken);

    Task CancelAsync(string confirmationNumber, CancellationToken cancellationToken);
}
