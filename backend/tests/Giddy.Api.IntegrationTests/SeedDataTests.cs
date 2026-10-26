using Giddy.Infrastructure.Persistence;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>The CLI's seed data is idempotent and safe to re-run.</summary>
public sealed class SeedDataTests
{
    [Fact]
    public async Task Seeding_twice_leaves_one_copy_of_the_demo_data()
    {
        var options = new DbContextOptionsBuilder<GiddyDbContext>().UseInMemoryDatabase($"seed-{Guid.NewGuid()}").Options;
        var cancel = TestContext.Current.CancellationToken;

        await using (var db = new GiddyDbContext(options))
        {
            await new DemoDataSeeder(db).SeedAsync(cancel);
        }

        await using (var db = new GiddyDbContext(options))
        {
            await new DemoDataSeeder(db).SeedAsync(cancel);
        }

        await using var check = new GiddyDbContext(options);
        var party = await check.Parties.SingleAsync(cancel);
        Assert.Equal("Zuri’s Dino Dig 7th", party.Name);
        Assert.Equal(2, party.Members.Count);
        Assert.Equal(DemoCatalogue.Items().Count(), await check.CatalogueItems.CountAsync(cancel));
        Assert.Equal(16, await check.Guests.CountAsync(cancel));
        Assert.Equal(1, await check.Disruptions.CountAsync(cancel));
    }
}
