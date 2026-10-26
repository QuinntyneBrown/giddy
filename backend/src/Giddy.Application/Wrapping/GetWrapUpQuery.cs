using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Wrapping;

public sealed record GetWrapUpQuery(Guid PartyId) : IRequest<WrapUpView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
