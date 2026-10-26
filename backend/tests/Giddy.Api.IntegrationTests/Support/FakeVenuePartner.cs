using System.Collections.Concurrent;
using Giddy.Application.Bookings;
using Giddy.Application.Guests;
using Giddy.Domain.Catalogue;
using NodaTime;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>A venue partner that holds and confirms in memory, with switches for the failure cases.</summary>
public sealed class FakeVenuePartner(IClock clock) : IVenuePartner
{
    private readonly ConcurrentDictionary<string, (Guid Venue, LocalDate Date, LocalTime Start)> holds = new();
    private readonly ConcurrentBag<(Guid Venue, LocalDate Date, LocalTime Start)> takenByOthers = [];
    private int next = 48213;

    public ConcurrentBag<BookingContact> Confirmed { get; } = [];

    public ConcurrentBag<string> Released { get; } = [];

    public ConcurrentBag<string> Cancelled { get; } = [];

    public ConcurrentBag<(string Venue, IReadOnlyList<AllergyEntry> Entries)> AllergyLists { get; } = [];

    public bool ConfirmTimesOut { get; set; }

    /// <summary>Another family books the slot while the parent is still filling in the dialog.</summary>
    public void TakeSlot(Guid venueId, LocalDate date, LocalTime start) => takenByOthers.Add((venueId, date, start));

    public Task<VenueHold> HoldAsync(CatalogueItem venue, LocalDate date, VenueSlot slot, CancellationToken cancellationToken)
    {
        if (takenByOthers.Contains((venue.Id, date, slot.Start)))
        {
            throw new SlotTakenException("Someone else just booked that slot.");
        }

        var hold = new VenueHold($"HOLD-{Guid.NewGuid():N}", clock.GetCurrentInstant() + Duration.FromHours(48));
        holds[hold.Reference] = (venue.Id, date, slot.Start);
        return Task.FromResult(hold);
    }

    public Task<string> ConfirmAsync(VenueHold hold, BookingContact contact, CancellationToken cancellationToken)
    {
        if (ConfirmTimesOut)
        {
            throw new VenueDidNotConfirmException("The venue did not confirm in time.");
        }

        Confirmed.Add(contact);
        return Task.FromResult($"DD-{Interlocked.Increment(ref next) - 1}");
    }

    public Task ReleaseAsync(VenueHold hold, CancellationToken cancellationToken)
    {
        holds.TryRemove(hold.Reference, out _);
        Released.Add(hold.Reference);
        return Task.CompletedTask;
    }

    public Task ShareAllergyListAsync(string venueName, Guid? venueId, IReadOnlyList<AllergyEntry> entries, CancellationToken cancellationToken)
    {
        AllergyLists.Add((venueName, entries));
        return Task.CompletedTask;
    }

    public Task CancelAsync(string confirmationNumber, CancellationToken cancellationToken)
    {
        Cancelled.Add(confirmationNumber);
        return Task.CompletedTask;
    }
}
