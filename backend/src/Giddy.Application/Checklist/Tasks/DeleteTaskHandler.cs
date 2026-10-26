using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Checklist.Tasks;

public sealed class DeleteTaskHandler(IGiddyDbContext db) : IRequestHandler<DeleteTaskCommand>
{
    public async Task Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        if (!party.RemoveTask(request.TaskId))
        {
            throw new NotFoundException("Task not found.");
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
