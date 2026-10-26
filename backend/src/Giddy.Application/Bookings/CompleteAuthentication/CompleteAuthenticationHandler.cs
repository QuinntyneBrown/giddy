using Giddy.Application.Common;
using Giddy.Domain.Bookings;
using Giddy.Domain.Calendar;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Bookings.CompleteAuthentication;

public sealed class CompleteAuthenticationHandler(
    IGiddyDbContext db, IVenuePartner partner, IPaymentGateway payments, BookingCompletion completion, TorontoCalendar calendar)
    : IRequestHandler<CompleteAuthenticationCommand, BookingView>
{
    public async Task<BookingView> Handle(CompleteAuthenticationCommand request, CancellationToken cancellationToken)
    {
        var booking = await db.Bookings.SingleOrDefaultAsync(b => b.Id == request.BookingId && b.PartyId == request.PartyId, cancellationToken)
            ?? throw new NotFoundException("Booking not found.");
        if (booking.State != BookingState.Holding || booking.PaymentId is null)
        {
            throw new ConflictException("This booking is no longer waiting for your bank.");
        }

        var authorisation = await payments.CompleteAuthenticationAsync(booking.PaymentId, cancellationToken);
        if (authorisation.Outcome != PaymentOutcome.Authorised)
        {
            await partner.ReleaseAsync(new VenueHold(booking.HoldReference, booking.HoldExpiresAt), CancellationToken.None);
            booking.Decline();
            await db.SaveChangesAsync(CancellationToken.None);
            throw new PaymentDeclinedException(
                $"Your bank didn’t approve {authorisation.Brand} ending {authorisation.Last4}, so nothing was charged. Try another card.");
        }

        await completion.CompleteAsync(booking, new BookingContact(booking.BookingName, booking.Mobile, booking.Child, booking.Notes), cancellationToken);
        var contact = await db.CatalogueItems.Where(i => i.Id == booking.VenueId).Select(i => i.Venue!.Contact).SingleAsync(cancellationToken);
        return BookingViews.From(booking, contact, calendar.Today);
    }
}
