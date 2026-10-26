using Giddy.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>Seeds a derived factory (for example one built with WithWebHostBuilder).</summary>
public sealed class GiddyApiFactorySeeder(IServiceProvider services)
{
    public async Task SeedDinoPartyAsync()
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<GiddyDbContext>();
        db.Parties.Add(TestData.DinoParty());
        await db.SaveChangesAsync();
    }
}
