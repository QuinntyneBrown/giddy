using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Guests.RemoveGuest;

/// <summary>Removes a guest; their parent is not messaged.</summary>
public sealed record RemoveGuestCommand(Guid PartyId, Guid GuestId) : IRequest, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
