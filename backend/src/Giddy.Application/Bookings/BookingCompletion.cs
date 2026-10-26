using Giddy.Application.Common;
using Giddy.Domain.Bookings;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Bookings;

/// <summary>
/// Finishes a booking once the deposit is authorised: the venue confirms, then the deposit is
/// captured. If the venue does not confirm, the authorisation is cancelled and the hold released,
/// so nothing is charged.
/// </summary>
public sealed class BookingCompletion(IGiddyDbContext db, IVenuePartner partner, IPaymentGateway payments, IPublisher publisher, ICurrentParent parent, IClock clock)
{
    public async Task CompleteAsync(Booking booking, BookingContact contact, CancellationToken cancellationToken)
    {
        var hold = new VenueHold(booking.HoldReference, booking.HoldExpiresAt);
        string confirmation;
        try
        {
            confirmation = await partner.ConfirmAsync(hold, contact, cancellationToken);
        }
        catch (VenueDidNotConfirmException)
        {
            await payments.VoidAsync(booking.PaymentId!, CancellationToken.None);
            await partner.ReleaseAsync(hold, CancellationToken.None);
            booking.Release();
            await db.SaveChangesAsync(CancellationToken.None);
            throw new BookingNotCompletedException(
                $"{booking.VenueName} didn’t confirm in time, so nothing was charged. Try again in a moment.");
        }

        await payments.CaptureAsync(booking.PaymentId!, cancellationToken);
        booking.Confirm(confirmation, clock.GetCurrentInstant());

        var venue = await db.CatalogueItems.SingleAsync(i => i.Id == booking.VenueId, cancellationToken);
        venue.Venue!.Booked.Add(new Domain.Catalogue.BookedSlot(booking.Date, booking.Start));
        await db.SaveChangesAsync(cancellationToken);

        await publisher.Publish(new BookingConfirmed(booking.Id, parent.Email), cancellationToken);
    }
}
