using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Conversations;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-013 and L2-014: past parties are read-only; only the owner deletes a party.</summary>
public sealed class LockAndDeletePartyTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan();
    private readonly Party lastYear = TestData.DinoParty(new LocalDate(2025, 11, 15));
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.AddRange(dinoParty, lastYear);
        db.Conversations.Add(new Conversation(Guid.NewGuid(), TestParent.Amara.Id, dinoParty.Id, Instant.FromUtc(2026, 10, 20, 12, 0)));
    });

    [Fact]
    public async Task A_party_whose_date_has_passed_rejects_changes_with_409()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var rename = await amara.PutAsJsonAsync($"/api/parties/{lastYear.Id}", new { name = "Changed" }, Cancel);
        var overview = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{lastYear.Id}/overview", Cancel);

        Assert.Equal(HttpStatusCode.Conflict, rename.StatusCode);
        Assert.True(overview.GetProperty("locked").GetBoolean());
        Assert.Equal("Zuri’s Dino Dig 7th", await factory.QueryAsync(db => db.Parties.Where(p => p.Id == lastYear.Id).Select(p => p.Name).SingleAsync(Cancel)));
    }

    [Fact]
    public async Task A_party_locks_on_the_day_after_it_in_Toronto()
    {
        factory.Clock.Reset(Instant.FromUtc(2026, 11, 15, 4, 59));
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var stillOpen = await amara.PutAsJsonAsync($"/api/parties/{dinoParty.Id}", new { name = "Party day" }, Cancel);

        factory.Clock.Reset(Instant.FromUtc(2026, 11, 15, 5, 1));
        var locked = await amara.PutAsJsonAsync($"/api/parties/{dinoParty.Id}", new { name = "Too late" }, Cancel);

        Assert.Equal(HttpStatusCode.OK, stillOpen.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, locked.StatusCode);
    }

    [Fact]
    public async Task The_owner_deletes_a_party_for_every_planner_and_its_chat_goes_too()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        using var kemi = factory.CreateClientFor(TestParent.Kemi);

        var response = await amara.DeleteAsync($"/api/parties/{dinoParty.Id}", Cancel);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await kemi.GetAsync($"/api/parties/{dinoParty.Id}", Cancel)).StatusCode);
        Assert.Equal(0, await factory.QueryAsync(db => db.Conversations.CountAsync(c => c.PartyId == dinoParty.Id, Cancel)));
    }

    [Theory]
    [InlineData("kemi", HttpStatusCode.Forbidden)]
    [InlineData("dev", HttpStatusCode.Forbidden)]
    [InlineData("stranger", HttpStatusCode.NotFound)]
    public async Task Only_the_owner_can_delete(string who, HttpStatusCode expected)
    {
        var parent = who switch { "kemi" => TestParent.Kemi, "dev" => TestParent.Dev, _ => TestParent.Stranger };
        using var client = await factory.CreateBrowserClientFor(parent);

        var response = await client.DeleteAsync($"/api/parties/{dinoParty.Id}", Cancel);

        Assert.Equal(expected, response.StatusCode);
        Assert.True(await factory.QueryAsync(db => db.Parties.AnyAsync(p => p.Id == dinoParty.Id, Cancel)));
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
