using NodaTime;

namespace Giddy.Domain.Bookings;

/// <summary>A venue slot booked for a party, from the hold through to confirmation or cancellation.</summary>
public sealed class Booking
{
    private Booking()
    {
        VenueName = string.Empty;
        Room = string.Empty;
        HoldReference = string.Empty;
        BookingName = string.Empty;
        Mobile = string.Empty;
        Child = string.Empty;
    }

    public Guid Id { get; private set; }

    public Guid PartyId { get; private set; }

    public Guid VenueId { get; private set; }

    public string VenueName { get; private set; }

    public LocalDate Date { get; private set; }

    public LocalTime Start { get; private set; }

    public LocalTime End { get; private set; }

    public string Room { get; private set; }

    public int Capacity { get; private set; }

    /// <summary>The venue's tax-inclusive price.</summary>
    public decimal Price { get; private set; }

    public decimal Deposit { get; private set; }

    public decimal Balance => Price - Deposit;

    public BookingState State { get; private set; }

    public string HoldReference { get; private set; }

    public Instant HoldExpiresAt { get; private set; }

    /// <summary>The provider's payment id; Giddy never stores card numbers.</summary>
    public string? PaymentId { get; private set; }

    public string? CardBrand { get; private set; }

    public string? CardLast4 { get; private set; }

    public string? ChallengeUrl { get; private set; }

    public string? ConfirmationNumber { get; private set; }

    public Guid BookedBy { get; private set; }

    public string BookingName { get; private set; }

    public string Mobile { get; private set; }

    public string Child { get; private set; }

    public string? Notes { get; private set; }

    /// <summary>The last day the deposit is refunded on cancellation.</summary>
    public LocalDate FreeCancellationUntil { get; private set; }

    public Instant CreatedAt { get; private set; }

    public Instant? ConfirmedAt { get; private set; }

    public Instant? CancelledAt { get; private set; }

    public bool Refunded { get; private set; }

    public static Booking Hold(
        Guid id, Guid partyId, Guid venueId, string venueName, LocalDate date, LocalTime start, LocalTime end,
        string room, int capacity, decimal price, decimal deposit, LocalDate freeCancellationUntil,
        string holdReference, Instant holdExpiresAt, Guid bookedBy, string bookingName, string mobile, string child, string? notes, Instant now) =>
        new()
        {
            Id = id,
            PartyId = partyId,
            VenueId = venueId,
            VenueName = venueName,
            Date = date,
            Start = start,
            End = end,
            Room = room,
            Capacity = capacity,
            Price = price,
            Deposit = deposit,
            FreeCancellationUntil = freeCancellationUntil,
            HoldReference = holdReference,
            HoldExpiresAt = holdExpiresAt,
            BookedBy = bookedBy,
            BookingName = bookingName.Trim(),
            Mobile = mobile.Trim(),
            Child = child.Trim(),
            Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim(),
            State = BookingState.Holding,
            CreatedAt = now,
        };

    public void Paying(string paymentId, string cardBrand, string cardLast4)
    {
        PaymentId = paymentId;
        CardBrand = cardBrand;
        CardLast4 = cardLast4;
    }

    public void AwaitAuthentication(string challengeUrl) => ChallengeUrl = challengeUrl;

    public void Confirm(string confirmationNumber, Instant now)
    {
        State = BookingState.Confirmed;
        ConfirmationNumber = confirmationNumber;
        ConfirmedAt = now;
        ChallengeUrl = null;
    }

    public void Decline()
    {
        State = BookingState.Declined;
        ChallengeUrl = null;
    }

    public void Release()
    {
        State = BookingState.Released;
        ChallengeUrl = null;
    }

    public bool IsRefundableOn(LocalDate today) => today <= FreeCancellationUntil;

    public void Cancel(bool refunded, Instant now)
    {
        State = BookingState.Cancelled;
        Refunded = refunded;
        CancelledAt = now;
    }
}
