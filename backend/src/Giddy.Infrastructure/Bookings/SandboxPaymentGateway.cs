using System.Collections.Concurrent;
using Giddy.Application.Bookings;

namespace Giddy.Infrastructure.Bookings;

/// <summary>
/// A test-mode payment provider until the PCI DSS Level 1 provider is chosen. It accepts only the
/// provider-style test tokens the web app's sandbox card fields produce, never card numbers:
/// "tok_visa" and "tok_mastercard" are approved, "tok_declined" is declined and "tok_3ds" asks
/// for a 3-D Secure challenge first.
/// </summary>
public sealed class SandboxPaymentGateway : IPaymentGateway
{
    private readonly ConcurrentDictionary<string, string> tokens = new();

    public Task<PaymentAuthorisation> AuthoriseAsync(PaymentRequest request, CancellationToken cancellationToken)
    {
        var id = $"pi_sandbox_{Guid.NewGuid():N}";
        tokens[id] = request.PaymentMethodToken;
        var (brand, last4) = Card(request.PaymentMethodToken);
        var outcome = request.PaymentMethodToken switch
        {
            "tok_declined" => PaymentOutcome.Declined,
            "tok_3ds" => PaymentOutcome.RequiresAuthentication,
            _ => PaymentOutcome.Authorised,
        };
        return Task.FromResult(new PaymentAuthorisation(outcome, id, brand, last4, outcome == PaymentOutcome.RequiresAuthentication ? $"sandbox://3ds/{id}" : null));
    }

    public Task<PaymentAuthorisation> CompleteAuthenticationAsync(string paymentId, CancellationToken cancellationToken)
    {
        var (brand, last4) = Card(tokens.GetValueOrDefault(paymentId) ?? string.Empty);
        return Task.FromResult(new PaymentAuthorisation(PaymentOutcome.Authorised, paymentId, brand, last4));
    }

    public Task CaptureAsync(string paymentId, CancellationToken cancellationToken) => Task.CompletedTask;

    public Task VoidAsync(string paymentId, CancellationToken cancellationToken) => Task.CompletedTask;

    public Task RefundAsync(string paymentId, CancellationToken cancellationToken) => Task.CompletedTask;

    private static (string Brand, string Last4) Card(string token) => token switch
    {
        "tok_mastercard" => ("Mastercard", "4444"),
        "tok_declined" => ("Visa", "0002"),
        "tok_3ds" => ("Visa", "3184"),
        _ => ("Visa", "4242"),
    };
}
