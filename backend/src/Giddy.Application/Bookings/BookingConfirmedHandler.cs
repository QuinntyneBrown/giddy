using System.Globalization;
using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Bookings;

/// <summary>Brings the plan up to date with a confirmed booking and emails the confirmation.</summary>
public sealed class BookingConfirmedHandler(IGiddyDbContext db, IEmailSender email) : INotificationHandler<BookingConfirmed>
{
    public async Task Handle(BookingConfirmed notification, CancellationToken cancellationToken)
    {
        var booking = await db.Bookings.SingleAsync(b => b.Id == notification.BookingId, cancellationToken);
        var party = await db.Parties.SingleAsync(p => p.Id == booking.PartyId, cancellationToken);
        party.RecordVenueBooked(booking.VenueId, booking.VenueName, booking.Price, booking.Deposit, booking.Start, booking.End);
        await db.SaveChangesAsync(cancellationToken);

        var when = $"{booking.Date.ToString("ddd d MMM", CultureInfo.InvariantCulture)}, {BookingFormats.Time.Format(booking.Start)}–{BookingFormats.Time.Format(booking.End)}";
        await email.SendAsync(
            new EmailMessage(
                notification.ParentEmail,
                $"{booking.VenueName} is booked for {party.Name} · {booking.ConfirmationNumber}",
                $"""
                {booking.VenueName} is booked for {when} in the {booking.Room}.
                Confirmation {booking.ConfirmationNumber}. Deposit of ${booking.Deposit:0} paid; ${booking.Balance:0} due on the day.
                Free cancellation until {booking.FreeCancellationUntil.ToString("ddd d MMM", CultureInfo.InvariantCulture)}. After that the deposit is non-refundable.
                Giddy added "{Domain.Parties.Party.AllergyListTask}" to your checklist.
                """),
            cancellationToken);
    }
}
