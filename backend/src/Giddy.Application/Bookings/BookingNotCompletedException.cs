namespace Giddy.Application.Bookings;

/// <summary>The venue did not confirm; the payment was cancelled so nothing was charged.</summary>
public sealed class BookingNotCompletedException(string message) : Exception(message);
