using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Families.Children;

public sealed class RemoveChildHandler(IGiddyDbContext db, ICurrentParent parent) : IRequestHandler<RemoveChildCommand>
{
    public async Task Handle(RemoveChildCommand request, CancellationToken cancellationToken)
    {
        var family = await db.Families.SingleOrDefaultAsync(f => f.Id == parent.Id, cancellationToken);
        if (family is null || !family.RemoveChild(request.ChildId))
        {
            throw new NotFoundException("Child not found.");
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
