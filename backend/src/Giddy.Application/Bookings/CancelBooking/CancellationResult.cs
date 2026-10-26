namespace Giddy.Application.Bookings.CancelBooking;

/// <param name="Amount">The deposit, refunded or kept by the venue.</param>
public sealed record CancellationResult(bool Refunded, decimal Amount);
