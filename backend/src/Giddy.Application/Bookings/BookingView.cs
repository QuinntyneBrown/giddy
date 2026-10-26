using Giddy.Domain.Bookings;

namespace Giddy.Application.Bookings;

/// <param name="ChallengeUrl">The issuer's 3-D Secure page while the bank checks it is the parent.</param>
public sealed record BookingView(
    Guid Id,
    Guid VenueId,
    string VenueName,
    string Date,
    string Start,
    string End,
    string Room,
    int Capacity,
    string? Contact,
    BookingState State,
    string? ConfirmationNumber,
    decimal Price,
    decimal Deposit,
    decimal Balance,
    CardView? Card,
    string FreeCancellationUntil,
    bool Refundable,
    string HoldExpiresAt,
    string? ChallengeUrl);
