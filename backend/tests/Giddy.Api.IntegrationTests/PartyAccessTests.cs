using System.Net;
using System.Net.Http.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-069: every party request checks membership and role on the server.</summary>
public sealed class PartyAccessTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty();
    private readonly Party strangersParty = TestData.StrangersParty();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db => db.Parties.AddRange(dinoParty, strangersParty));

    [Fact]
    public async Task Lists_only_the_parties_a_parent_belongs_to_with_their_role()
    {
        using var client = factory.CreateClientFor(TestParent.Amara);

        var parties = await client.GetFromJsonAsync<PartySummaryResponse[]>("/api/parties", Cancel);

        var party = Assert.Single(parties!);
        Assert.Equal(dinoParty.Id, party.Id);
        Assert.Equal("owner", party.Role);
    }

    [Theory]
    [InlineData("kemi", "coPlanner")]
    [InlineData("dev", "viewer")]
    public async Task Co_planners_and_viewers_can_read_the_party_with_their_role(string who, string role)
    {
        using var client = factory.CreateClientFor(who == "kemi" ? TestParent.Kemi : TestParent.Dev);

        var party = await client.GetFromJsonAsync<PartySummaryResponse>($"/api/parties/{dinoParty.Id}", Cancel);

        Assert.Equal("Zuri’s Dino Dig 7th", party!.Name);
        Assert.Equal(role, party.Role);
    }

    [Fact]
    public async Task A_party_the_parent_cannot_know_about_is_not_found()
    {
        using var client = factory.CreateClientFor(TestParent.Stranger);

        var response = await client.GetAsync($"/api/parties/{dinoParty.Id}", Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Party_identifiers_are_not_guessable_sequences()
    {
        using var client = factory.CreateClientFor(TestParent.Amara);

        var response = await client.GetAsync("/api/parties/1", Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Owners_and_co_planners_can_rename_the_party()
    {
        using var client = await factory.CreateBrowserClientFor(TestParent.Kemi);

        var response = await client.PutAsJsonAsync($"/api/parties/{dinoParty.Id}", new { name = "Zuri’s Big Dino Dig" }, Cancel);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Zuri’s Big Dino Dig", await NameOf(dinoParty.Id));
    }

    [Fact]
    public async Task A_viewer_cannot_change_the_party()
    {
        using var client = await factory.CreateBrowserClientFor(TestParent.Dev);

        var response = await client.PutAsJsonAsync($"/api/parties/{dinoParty.Id}", new { name = "Hijacked" }, Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal("Zuri’s Dino Dig 7th", await NameOf(dinoParty.Id));
    }

    [Fact]
    public async Task Another_familys_token_cannot_change_the_party()
    {
        using var client = await factory.CreateBrowserClientFor(TestParent.Stranger);

        var response = await client.PutAsJsonAsync($"/api/parties/{dinoParty.Id}", new { name = "Hijacked" }, Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("Zuri’s Dino Dig 7th", await NameOf(dinoParty.Id));
    }

    private Task<string> NameOf(Guid partyId) =>
        factory.QueryAsync(db => db.Parties.Where(p => p.Id == partyId).Select(p => p.Name).SingleAsync());

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private sealed record PartySummaryResponse(Guid Id, string Name, string Role);
}
