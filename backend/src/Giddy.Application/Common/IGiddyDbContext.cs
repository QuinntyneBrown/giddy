using Giddy.Domain.Catalogue;
using Giddy.Domain.Conversations;
using Giddy.Domain.Memories;
using Giddy.Domain.Parties;
using Giddy.Domain.Proposals;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Common;

public interface IGiddyDbContext
{
    DbSet<Party> Parties { get; }

    DbSet<CatalogueItem> CatalogueItems { get; }

    DbSet<Conversation> Conversations { get; }

    DbSet<AgentTurn> AgentTurns { get; }

    DbSet<Memory> Memories { get; }

    DbSet<Proposal> Proposals { get; }

    DbSet<TurnLogEntry> TurnLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
