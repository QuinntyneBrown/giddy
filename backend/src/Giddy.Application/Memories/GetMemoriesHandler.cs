using Giddy.Application.Common;
using Giddy.Application.Conversations.Views;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Memories;

public sealed class GetMemoriesHandler(IGiddyDbContext db, ICurrentParent parent) : IRequestHandler<GetMemoriesQuery, IReadOnlyList<MemoryView>>
{
    public async Task<IReadOnlyList<MemoryView>> Handle(GetMemoriesQuery request, CancellationToken cancellationToken) =>
        await db.Memories.Where(m => m.FamilyId == parent.Id)
            .OrderBy(m => m.RememberedAt)
            .Select(m => new MemoryView(m.Id, m.Text))
            .ToListAsync(cancellationToken);
}
