using Giddy.Application.Checklist.View;
using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Checklist.Tasks;

/// <summary>Ticks a task off, or puts it back to do.</summary>
public sealed record SetTaskDoneCommand(Guid PartyId, Guid TaskId, bool Done) : IRequest<TaskView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
