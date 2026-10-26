using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Checklist.GiddyDoes;

/// <summary>"Let Giddy do it", after the parent confirmed what will be sent.</summary>
public sealed record LetGiddyDoTaskCommand(Guid PartyId, Guid TaskId) : IRequest<GiddyDidTask>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
