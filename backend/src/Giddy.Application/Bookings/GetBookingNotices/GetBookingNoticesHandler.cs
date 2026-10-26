using Giddy.Application.Common;
using Giddy.Domain.Bookings;
using Giddy.Domain.Calendar;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Bookings.GetBookingNotices;

/// <summary>
/// Describes the latest venue booking: a live hold, a confirmation, or a declined deposit. Known
/// disruptions near a booked venue on the party day are added until the party has happened.
/// </summary>
public sealed class GetBookingNoticesHandler(IGiddyDbContext db, IClock clock, TorontoCalendar calendar)
    : IRequestHandler<GetBookingNoticesQuery, IReadOnlyList<BookingNotice>>
{
    public async Task<IReadOnlyList<BookingNotice>> Handle(GetBookingNoticesQuery request, CancellationToken cancellationToken)
    {
        var notices = new List<BookingNotice>();
        var latest = await db.Bookings
            .Where(b => b.PartyId == request.PartyId)
            .OrderByDescending(b => b.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
        if (latest is null)
        {
            return notices;
        }

        var now = clock.GetCurrentInstant();
        switch (latest.State)
        {
            case BookingState.Holding when latest.HoldExpiresAt > now:
                var expires = latest.HoldExpiresAt.InZone(TorontoCalendar.Zone);
                notices.Add(new BookingNotice(
                    "hold",
                    "info",
                    $"{latest.VenueName} is holding {BookingText.Time(latest.Start)} for you",
                    $"The hold lasts until {BookingText.Day(expires.Date)}, {BookingText.Time(expires.TimeOfDay)}. Pay the {BookingText.Money(latest.Deposit)} deposit to lock it in.",
                    true,
                    latest.Id,
                    latest.VenueId));
                break;
            case BookingState.Confirmed:
                notices.Add(new BookingNotice(
                    "confirmed",
                    "success",
                    $"{latest.VenueName} confirmed your booking",
                    $"{BookingText.Day(latest.Date)}, {BookingText.Range(latest.Start, latest.End)} · confirmation {latest.ConfirmationNumber}.",
                    true,
                    latest.Id,
                    latest.VenueId));
                await AddDisruptionsAsync(latest, notices, cancellationToken);
                break;
            case BookingState.Declined:
                var venue = await db.CatalogueItems.SingleAsync(i => i.Id == latest.VenueId, cancellationToken);
                var stillFree = venue.FreeSlotsOn(latest.Date).Any(s => s.Start == latest.Start);
                notices.Add(new BookingNotice(
                    "declined",
                    "danger",
                    "Your deposit payment didn’t go through",
                    $"{latest.CardBrand} ending {latest.CardLast4} was declined, so {latest.VenueName} released the hold."
                        + (stillFree ? $" The {BookingText.Time(latest.Start)} slot is still free right now." : string.Empty),
                    false,
                    latest.Id,
                    latest.VenueId));
                break;
        }

        return notices;
    }

    private async Task AddDisruptionsAsync(Booking booking, List<BookingNotice> notices, CancellationToken cancellationToken)
    {
        if (calendar.Today > booking.Date)
        {
            return;
        }

        var venue = await db.CatalogueItems.SingleAsync(i => i.Id == booking.VenueId, cancellationToken);
        var candidates = await db.Disruptions.Where(d => d.From <= booking.Date && d.To >= booking.Date).ToListAsync(cancellationToken);
        notices.AddRange(candidates
            .Where(d => d.Affects(venue.Latitude, venue.Longitude, booking.Date))
            .Select(d => new BookingNotice("disruption", "warning", d.Title, d.Detail, false, booking.Id, booking.VenueId)));
    }
}
