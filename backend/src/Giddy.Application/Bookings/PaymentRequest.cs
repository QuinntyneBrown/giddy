namespace Giddy.Application.Bookings;

/// <param name="PaymentMethodToken">The provider's token for the card.</param>
/// <param name="Amount">Canadian dollars.</param>
public sealed record PaymentRequest(string PaymentMethodToken, decimal Amount, string IdempotencyKey, string Description);
