using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Guests.GetGuests;

public sealed record GetGuestsQuery(Guid PartyId) : IRequest<GuestListView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
