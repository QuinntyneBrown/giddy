using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Bookings.CancelBooking;

public sealed record CancelBookingCommand(Guid PartyId, Guid BookingId) : IRequest<CancellationResult>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
