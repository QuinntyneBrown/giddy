using Giddy.Application.Checklist.View;
using Giddy.Application.Common;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Checklist.Tasks;

public sealed class SaveTaskHandler(IGiddyDbContext db, ChecklistProjection projection, ICurrentParent parent) : IRequestHandler<SaveTaskCommand, TaskView>
{
    public async Task<TaskView> Handle(SaveTaskCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var existing = request.TaskId is { } id ? party.FindTask(id) ?? throw new NotFoundException("Task not found.") : null;
        var due = LocalDatePattern.Iso.Parse(request.Due).Value;
        var task = (existing ?? new ChecklistTask(string.Empty, due)) with
        {
            Title = request.Title.Trim(),
            Due = due,
            OwnerId = request.OwnerId ?? parent.Id,
            RemindMe = request.RemindMe,
        };
        party.SaveTask(task);
        await db.SaveChangesAsync(cancellationToken);
        return await projection.TaskAsync(party, task, cancellationToken);
    }
}
