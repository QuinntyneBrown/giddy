using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Giddy.Infrastructure.Persistence;

/// <summary>Lets <c>dotnet ef</c> build the model to create migrations without a running database.</summary>
public sealed class GiddyDbContextDesignTimeFactory : IDesignTimeDbContextFactory<GiddyDbContext>
{
    public GiddyDbContext CreateDbContext(string[] args) => new(
        new DbContextOptionsBuilder<GiddyDbContext>()
            .UseSqlServer(Environment.GetEnvironmentVariable("ConnectionStrings__Giddy") ?? "Server=localhost;Database=Giddy;Integrated Security=true")
            .Options);
}
