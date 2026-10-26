namespace Giddy.Application.Bookings;

/// <param name="ChallengeUrl">The issuer's 3-D Secure page when authentication is required.</param>
public sealed record PaymentAuthorisation(PaymentOutcome Outcome, string PaymentId, string Brand, string Last4, string? ChallengeUrl = null);
