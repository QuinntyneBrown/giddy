using Giddy.Application.Checklist.View;
using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Live;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Checklist.Tasks;

/// <summary>Ticking a task updates progress and readiness, and the other planners hear about it live.</summary>
public sealed class SetTaskDoneHandler(IGiddyDbContext db, ChecklistProjection projection, TorontoCalendar calendar, ICurrentParent parent, IClock clock)
    : IRequestHandler<SetTaskDoneCommand, TaskView>
{
    public async Task<TaskView> Handle(SetTaskDoneCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        if (party.FindTask(request.TaskId) is not { } before)
        {
            throw new NotFoundException("Task not found.");
        }

        var task = party.SetTaskDone(request.TaskId, request.Done, calendar.Today);
        if (request.Done && !before.Done)
        {
            var firstName = parent.Name.Split(' ')[0];
            db.PartyEvents.Add(new PartyEvent(
                party.Id, null, "task", "success", $"{firstName} ticked off {task.Title}", $"On the checklist for {party.Name}.", null, null, clock.GetCurrentInstant(), parent.Id));
        }

        await db.SaveChangesAsync(cancellationToken);
        return await projection.TaskAsync(party, task, cancellationToken);
    }
}
