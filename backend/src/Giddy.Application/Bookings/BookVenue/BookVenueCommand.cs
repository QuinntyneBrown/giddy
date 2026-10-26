using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Bookings.BookVenue;

/// <param name="Date">ISO date; must be the party's date.</param>
/// <param name="Start">The slot's start time, for example "13:00".</param>
public sealed record BookVenueCommand(
    Guid PartyId, Guid VenueId, string Date, string Start, string BookingName, string Mobile, string Child, string? Notes, PaymentChoice Payment)
    : IRequest<BookingView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
