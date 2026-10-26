using Giddy.Application.Common;
using Giddy.Domain.Bookings;
using Giddy.Domain.Calendar;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Bookings.CancelBooking;

/// <summary>
/// Cancels at the venue and releases the slot. Inside the free-cancellation window the deposit is
/// refunded; after it, the venue keeps the deposit, as the dialog told the parent before they confirmed.
/// </summary>
public sealed class CancelBookingHandler(IGiddyDbContext db, IVenuePartner partner, IPaymentGateway payments, TorontoCalendar calendar, IClock clock)
    : IRequestHandler<CancelBookingCommand, CancellationResult>
{
    public async Task<CancellationResult> Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await db.Bookings.SingleOrDefaultAsync(b => b.Id == request.BookingId && b.PartyId == request.PartyId, cancellationToken)
            ?? throw new NotFoundException("Booking not found.");
        if (booking.State != BookingState.Confirmed)
        {
            throw new ConflictException("This booking isn’t active any more.");
        }

        var refund = booking.IsRefundableOn(calendar.Today);
        await partner.CancelAsync(booking.ConfirmationNumber!, cancellationToken);
        if (refund)
        {
            await payments.RefundAsync(booking.PaymentId!, cancellationToken);
        }

        booking.Cancel(refund, clock.GetCurrentInstant());
        var venue = await db.CatalogueItems.SingleAsync(i => i.Id == booking.VenueId, cancellationToken);
        venue.Venue!.Booked.RemoveAll(b => b.Date == booking.Date && b.Start == booking.Start);
        var party = await db.Parties.SingleAsync(p => p.Id == booking.PartyId, cancellationToken);
        party.RecordVenueCancelled(refund);
        await db.SaveChangesAsync(cancellationToken);
        return new CancellationResult(refund, booking.Deposit);
    }
}
