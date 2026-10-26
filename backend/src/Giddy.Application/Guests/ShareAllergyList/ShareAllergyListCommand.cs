using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Guests.ShareAllergyList;

public sealed record ShareAllergyListCommand(Guid PartyId) : IRequest<AllergyListShared>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
