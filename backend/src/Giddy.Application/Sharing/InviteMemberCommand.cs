using Giddy.Application.Parties;
using Giddy.Domain.Parties;
using MediatR;

namespace Giddy.Application.Sharing;

public sealed record InviteMemberCommand(Guid PartyId, string Email, PartyRole Role) : IRequest, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
