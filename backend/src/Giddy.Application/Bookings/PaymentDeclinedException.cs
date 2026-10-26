namespace Giddy.Application.Bookings;

/// <summary>The card was declined; the hold was released and nothing was charged.</summary>
public sealed class PaymentDeclinedException(string message) : Exception(message);
