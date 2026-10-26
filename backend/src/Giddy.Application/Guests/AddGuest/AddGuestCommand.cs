using Giddy.Application.Guests.GetGuests;
using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Guests.AddGuest;

/// <param name="SendNow">Invite straight away if the invitations have already gone out.</param>
public sealed record AddGuestCommand(Guid PartyId, string ChildName, string ParentName, string Email, string? Mobile, bool SendNow)
    : IRequest<GuestView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
