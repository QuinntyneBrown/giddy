using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Wrapping;

public sealed record SendThankYousCommand(Guid PartyId) : IRequest<ThankYousSent>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.WrapUp;
}
