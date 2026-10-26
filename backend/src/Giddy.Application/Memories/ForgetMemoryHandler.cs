using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Memories;

/// <summary>
/// Deletes a memory immediately. Giddy reads memories fresh at the start of every turn and keeps no
/// other copy, so the next turn no longer knows it.
/// </summary>
public sealed class ForgetMemoryHandler(IGiddyDbContext db, ICurrentParent parent) : IRequestHandler<ForgetMemoryCommand>
{
    public async Task Handle(ForgetMemoryCommand request, CancellationToken cancellationToken)
    {
        var memory = await db.Memories.SingleOrDefaultAsync(m => m.Id == request.MemoryId && m.FamilyId == parent.Id, cancellationToken)
            ?? throw new NotFoundException("Memory not found.");
        db.Memories.Remove(memory);
        await db.SaveChangesAsync(cancellationToken);
    }
}
