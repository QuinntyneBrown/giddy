using Giddy.Application.Common;
using Giddy.Domain.Bookings;
using Giddy.Domain.Calendar;
using Giddy.Domain.Payments;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Bookings.BookVenue;

/// <summary>
/// Holds the slot at the venue, authorises the deposit and confirms the booking. A hold is never
/// left without a payment, or a payment without a booking: each failure undoes the earlier steps.
/// </summary>
public sealed class BookVenueHandler(
    IGiddyDbContext db,
    IVenuePartner partner,
    IPaymentGateway payments,
    BookingCompletion completion,
    ICurrentParent parent,
    TorontoCalendar calendar,
    IClock clock) : IRequestHandler<BookVenueCommand, BookingView>
{
    public async Task<BookingView> Handle(BookVenueCommand request, CancellationToken cancellationToken)
    {
        var token = await PaymentTokenAsync(request.Payment, cancellationToken);
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var venue = await db.CatalogueItems.SingleOrDefaultAsync(i => i.Id == request.VenueId && i.Venue != null, cancellationToken)
            ?? throw new NotFoundException("Venue not found.");
        var date = BookingFormats.Date.Parse(request.Date).Value;
        if (date != party.Date)
        {
            throw new ConflictException("That slot is on a different day from the party.");
        }

        var start = BookingFormats.Time.Parse(request.Start).Value;
        var slot = venue.Venue!.Slots.SingleOrDefault(s => s.Start == start)
            ?? throw new NotFoundException("Slot not found.");

        if (!venue.FreeSlotsOn(date).Contains(slot))
        {
            throw SlotUnavailable(venue, date, slot);
        }

        VenueHold hold;
        try
        {
            hold = await partner.HoldAsync(venue, date, slot, cancellationToken);
        }
        catch (SlotTakenException)
        {
            throw SlotUnavailable(venue, date, slot);
        }

        var booking = Booking.Hold(
            Guid.NewGuid(), party.Id, venue.Id, venue.Name, date, slot.Start, slot.End,
            venue.Venue.Room, venue.Capacity ?? 0, venue.Price, venue.Venue.Deposit, date.PlusDays(-venue.Venue.FreeCancellationDays),
            hold.Reference, hold.ExpiresAt, parent.Id, request.BookingName, request.Mobile, request.Child, request.Notes,
            clock.GetCurrentInstant());
        db.Bookings.Add(booking);

        var authorisation = await payments.AuthoriseAsync(
            new PaymentRequest(token, booking.Deposit, booking.Id.ToString(), $"{venue.Name} deposit for {party.Name}"),
            cancellationToken);
        booking.Paying(authorisation.PaymentId, authorisation.Brand, authorisation.Last4);

        if (authorisation.Outcome == PaymentOutcome.Declined)
        {
            await partner.ReleaseAsync(hold, CancellationToken.None);
            booking.Decline();
            await db.SaveChangesAsync(CancellationToken.None);
            throw new PaymentDeclinedException(
                $"{authorisation.Brand} ending {authorisation.Last4} was declined, so nothing was charged. Try another card.");
        }

        if (authorisation.Outcome == PaymentOutcome.RequiresAuthentication)
        {
            booking.AwaitAuthentication(authorisation.ChallengeUrl!);
            await db.SaveChangesAsync(cancellationToken);
            return BookingViews.From(booking, venue.Venue.Contact, calendar.Today);
        }

        await completion.CompleteAsync(booking, new BookingContact(booking.BookingName, booking.Mobile, booking.Child, booking.Notes), cancellationToken);
        if (request.Payment.SaveCard && request.Payment.SavedCardId is null)
        {
            db.SavedCards.Add(new SavedCard(Guid.NewGuid(), parent.Id, token, authorisation.Brand, authorisation.Last4, clock.GetCurrentInstant()));
            await db.SaveChangesAsync(cancellationToken);
        }

        return BookingViews.From(booking, venue.Venue.Contact, calendar.Today);
    }

    private async Task<string> PaymentTokenAsync(PaymentChoice payment, CancellationToken cancellationToken)
    {
        if (payment.SavedCardId is not { } savedCardId)
        {
            return payment.Token!;
        }

        return await db.SavedCards
            .Where(c => c.Id == savedCardId && c.ParentId == parent.Id)
            .Select(c => c.ProviderToken)
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Saved card not found.");
    }

    private static SlotUnavailableException SlotUnavailable(Domain.Catalogue.CatalogueItem venue, LocalDate date, Domain.Catalogue.VenueSlot taken) => new(
        $"{BookingFormats.Time.Format(taken.Start)} at {venue.Name} is no longer free, so nothing was charged.",
        venue.FreeSlotsOn(date)
            .Where(s => s != taken)
            .Select(s => new AlternativeSlot(venue.Id, venue.Name, BookingFormats.Time.Format(s.Start), BookingFormats.Time.Format(s.End)))
            .ToList());
}
