using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Bookings.CompleteAuthentication;

/// <summary>The parent finished the bank's 3-D Secure challenge for a held booking.</summary>
public sealed record CompleteAuthenticationCommand(Guid PartyId, Guid BookingId) : IRequest<BookingView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
