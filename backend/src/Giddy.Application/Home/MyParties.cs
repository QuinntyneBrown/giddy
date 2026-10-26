using Giddy.Application.Common;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Home;

public static class MyParties
{
    /// <summary>The parties the parent belongs to.</summary>
    public static Task<List<Party>> LoadAsync(IGiddyDbContext db, Guid parentId, CancellationToken cancellationToken) =>
        db.Parties.Where(p => p.Members.Any(m => m.ParentId == parentId)).ToListAsync(cancellationToken);
}
