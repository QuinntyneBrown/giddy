using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Checklist.Tasks;

public sealed record DeleteTaskCommand(Guid PartyId, Guid TaskId) : IRequest, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
