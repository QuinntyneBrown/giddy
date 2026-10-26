using System.Security.Cryptography;
using Giddy.Application.Bookings;
using Giddy.Domain.Catalogue;
using NodaTime;

namespace Giddy.Infrastructure.Bookings;

/// <summary>
/// Books against the slots venues share with Giddy until partner booking APIs are connected.
/// Holds last 48 hours, as partner venues offer.
/// </summary>
public sealed class CatalogueVenuePartner(IClock clock) : IVenuePartner
{
    public Task<VenueHold> HoldAsync(CatalogueItem venue, LocalDate date, VenueSlot slot, CancellationToken cancellationToken)
    {
        if (!venue.FreeSlotsOn(date).Contains(slot))
        {
            throw new SlotTakenException("That slot is already booked.");
        }

        return Task.FromResult(new VenueHold($"HOLD-{Guid.NewGuid():N}", clock.GetCurrentInstant() + Duration.FromHours(48)));
    }

    public Task<string> ConfirmAsync(VenueHold hold, BookingContact contact, CancellationToken cancellationToken) =>
        Task.FromResult($"GD-{RandomNumberGenerator.GetInt32(10000, 100000)}");

    public Task ReleaseAsync(VenueHold hold, CancellationToken cancellationToken) => Task.CompletedTask;

    public Task CancelAsync(string confirmationNumber, CancellationToken cancellationToken) => Task.CompletedTask;

    public Task ShareAllergyListAsync(string venueName, Guid? venueId, IReadOnlyList<Application.Guests.AllergyEntry> entries, CancellationToken cancellationToken) =>
        Task.CompletedTask;
}
