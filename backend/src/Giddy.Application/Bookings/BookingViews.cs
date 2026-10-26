using Giddy.Domain.Bookings;
using NodaTime;
using NodaTime.Text;

namespace Giddy.Application.Bookings;

public static class BookingViews
{
    public static BookingView From(Booking booking, string? contact, LocalDate today) => new(
        booking.Id,
        booking.VenueId,
        booking.VenueName,
        BookingFormats.Date.Format(booking.Date),
        BookingFormats.Time.Format(booking.Start),
        BookingFormats.Time.Format(booking.End),
        booking.Room,
        booking.Capacity,
        contact,
        booking.State,
        booking.ConfirmationNumber,
        booking.Price,
        booking.Deposit,
        booking.Balance,
        booking.CardBrand is { } brand && booking.CardLast4 is { } last4 ? new CardView(brand, last4) : null,
        BookingFormats.Date.Format(booking.FreeCancellationUntil),
        booking.IsRefundableOn(today),
        InstantPattern.General.Format(booking.HoldExpiresAt),
        booking.ChallengeUrl);
}
