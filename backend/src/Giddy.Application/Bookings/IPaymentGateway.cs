namespace Giddy.Application.Bookings;

/// <summary>
/// The payment provider. Card details stay in the provider's hosted fields; Giddy only ever sees
/// the provider's token, the card brand and the last four digits.
/// </summary>
public interface IPaymentGateway
{
    Task<PaymentAuthorisation> AuthoriseAsync(PaymentRequest request, CancellationToken cancellationToken);

    /// <summary>Checks the outcome once the parent has finished the issuer's 3-D Secure challenge.</summary>
    Task<PaymentAuthorisation> CompleteAuthenticationAsync(string paymentId, CancellationToken cancellationToken);

    Task CaptureAsync(string paymentId, CancellationToken cancellationToken);

    /// <summary>Cancels an authorisation that was never captured, so nothing is charged.</summary>
    Task VoidAsync(string paymentId, CancellationToken cancellationToken);

    Task RefundAsync(string paymentId, CancellationToken cancellationToken);
}
