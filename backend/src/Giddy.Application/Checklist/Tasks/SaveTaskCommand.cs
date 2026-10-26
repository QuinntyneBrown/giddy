using Giddy.Application.Checklist.View;
using Giddy.Application.Parties;
using MediatR;
namespace Giddy.Application.Checklist.Tasks;

/// <param name="TaskId">Null to add a task; the task's id to change it.</param>
/// <param name="Due">yyyy-MM-dd.</param>
/// <param name="OwnerId">The planner who does it; null for the parent saving it.</param>
public sealed record SaveTaskCommand(Guid PartyId, Guid? TaskId, string Title, string Due, Guid? OwnerId, bool RemindMe)
    : IRequest<TaskView>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
