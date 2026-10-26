using Giddy.Application.Bookings;
using Giddy.Domain.Catalogue;

namespace Giddy.Application.Venues.Detail;

/// <param name="SelectedSlot">The earliest free slot, selected by default.</param>
/// <param name="FreeCancellationUntil">The last day the deposit is refunded for a booking on <paramref name="Date"/>.</param>
/// <param name="Booking">The party's live booking at this venue, if any.</param>
public sealed record VenueDetail(
    Guid Id,
    string Name,
    string Emoji,
    string PhotoDescription,
    decimal Rating,
    int ReviewCount,
    string Address,
    string Neighbourhood,
    double? DistanceKm,
    string Description,
    IReadOnlyList<string> Features,
    decimal Price,
    int DurationMinutes,
    int Capacity,
    IReadOnlyList<string> Includes,
    IReadOnlyList<VenueAddOn> AddOns,
    IReadOnlyList<VenueReview> Reviews,
    string Date,
    IReadOnlyList<VenueSlotState> Slots,
    string? SelectedSlot,
    bool FullyBooked,
    FreeDate? NearestFreeDate,
    SimilarVenue? SimilarVenue,
    bool Favourite,
    string Room,
    decimal Deposit,
    string FreeCancellationUntil,
    BookingView? Booking);
