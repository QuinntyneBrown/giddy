using Giddy.Application.Checklist.View;
using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Checklist.Tasks;

/// <summary>Ticks a task off, or puts it back to do.</summary>
/// <param name="ExpectedVersion">The version the planner saw, for a change made offline; null to apply it regardless.</param>
public sealed record SetTaskDoneCommand(Guid PartyId, Guid TaskId, bool Done, string? ExpectedVersion = null) : IRequest<TaskView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
