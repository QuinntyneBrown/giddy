using System.Collections.Concurrent;
using Giddy.Application.Bookings;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>
/// A payment provider in memory. "tok_visa" is approved, "tok_declined" is declined and
/// "tok_3ds" needs a 3-D Secure challenge first.
/// </summary>
public sealed class FakePaymentGateway : IPaymentGateway
{
    private readonly ConcurrentDictionary<string, PaymentRequest> payments = new();

    public ConcurrentBag<PaymentRequest> Authorised { get; } = [];

    public ConcurrentBag<string> Captured { get; } = [];

    public ConcurrentBag<string> Voided { get; } = [];

    public ConcurrentBag<string> Refunded { get; } = [];

    /// <summary>Whether the parent passes the issuer's challenge.</summary>
    public bool ChallengePasses { get; set; } = true;

    public Task<PaymentAuthorisation> AuthoriseAsync(PaymentRequest request, CancellationToken cancellationToken)
    {
        var id = $"pi_{Guid.NewGuid():N}";
        payments[id] = request;
        var (brand, last4) = Card(request.PaymentMethodToken);
        switch (request.PaymentMethodToken)
        {
            case "tok_declined":
                return Task.FromResult(new PaymentAuthorisation(PaymentOutcome.Declined, id, brand, last4));
            case "tok_3ds":
                return Task.FromResult(new PaymentAuthorisation(PaymentOutcome.RequiresAuthentication, id, brand, last4, $"https://issuer.example/3ds/{id}"));
            default:
                Authorised.Add(request);
                return Task.FromResult(new PaymentAuthorisation(PaymentOutcome.Authorised, id, brand, last4));
        }
    }

    public Task<PaymentAuthorisation> CompleteAuthenticationAsync(string paymentId, CancellationToken cancellationToken)
    {
        var request = payments[paymentId];
        var (brand, last4) = Card(request.PaymentMethodToken);
        if (!ChallengePasses)
        {
            return Task.FromResult(new PaymentAuthorisation(PaymentOutcome.Declined, paymentId, brand, last4));
        }

        Authorised.Add(request);
        return Task.FromResult(new PaymentAuthorisation(PaymentOutcome.Authorised, paymentId, brand, last4));
    }

    public Task CaptureAsync(string paymentId, CancellationToken cancellationToken)
    {
        Captured.Add(paymentId);
        return Task.CompletedTask;
    }

    public Task VoidAsync(string paymentId, CancellationToken cancellationToken)
    {
        Voided.Add(paymentId);
        return Task.CompletedTask;
    }

    public Task RefundAsync(string paymentId, CancellationToken cancellationToken)
    {
        Refunded.Add(paymentId);
        return Task.CompletedTask;
    }

    private static (string Brand, string Last4) Card(string token) => token switch
    {
        "tok_mastercard" => ("Mastercard", "4444"),
        "tok_declined" => ("Visa", "0002"),
        "tok_3ds" => ("Visa", "3184"),
        _ => ("Visa", "4242"),
    };
}
