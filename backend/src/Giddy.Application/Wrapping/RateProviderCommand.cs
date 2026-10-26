using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Wrapping;

public sealed record RateProviderCommand(Guid PartyId, Guid ProviderId, int Stars, string? Review) : IRequest<ProviderView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.WrapUp;
}
