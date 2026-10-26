using Giddy.Application.Guests.GetGuests;
using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Guests.RestoreGuest;

/// <summary>Undo: brings a removed guest back with their reply.</summary>
public sealed record RestoreGuestCommand(Guid PartyId, Guid GuestId) : IRequest<GuestView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
