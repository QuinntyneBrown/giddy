using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Common;

public interface IGiddyDbContext
{
    DbSet<Party> Parties { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
