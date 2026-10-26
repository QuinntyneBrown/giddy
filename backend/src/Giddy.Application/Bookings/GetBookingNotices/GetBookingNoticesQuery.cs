using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Bookings.GetBookingNotices;

/// <summary>The banners the party overview shows about the venue booking.</summary>
public sealed record GetBookingNoticesQuery(Guid PartyId) : IRequest<IReadOnlyList<BookingNotice>>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
