using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Sharing;

public sealed record GetMembersQuery(Guid PartyId) : IRequest<MembersView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
