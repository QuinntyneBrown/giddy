using Giddy.Application.Common;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Infrastructure.Persistence;

public sealed class GiddyDbContext(DbContextOptions<GiddyDbContext> options) : DbContext(options), IGiddyDbContext
{
    public DbSet<Party> Parties => Set<Party>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GiddyDbContext).Assembly);
}
