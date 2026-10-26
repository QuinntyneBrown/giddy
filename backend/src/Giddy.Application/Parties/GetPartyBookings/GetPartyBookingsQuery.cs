using MediatR;

namespace Giddy.Application.Parties.GetPartyBookings;

/// <summary>Booking statuses, loaded separately so a vendor-status failure stays in its own section.</summary>
public sealed record GetPartyBookingsQuery(Guid PartyId) : IRequest<IReadOnlyList<PartyBookingView>>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
