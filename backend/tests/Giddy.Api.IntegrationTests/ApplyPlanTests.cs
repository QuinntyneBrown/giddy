using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-018: Giddy's plan changes the party only when a planner confirms it.</summary>
public sealed class ApplyPlanTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty();
    private ChatClient amara = null!;
    private Guid proposalId;
    private Guid conversationId;

    public async ValueTask InitializeAsync()
    {
        await factory.SeedAsync(db =>
        {
            db.Parties.Add(dinoParty);
            db.CatalogueItems.AddRange(DemoCatalogue.Items());
        });
        amara = new ChatClient(await factory.CreateBrowserClientFor(TestParent.Amara));
        factory.Model
            .CallsTools(("list_themes", new { interest = "dinosaurs" }), ("search_venues", null), ("find_cakes", null))
            .CallsTool("propose_plan", new
            {
                title = "Zuri’s Dino Dig 7th",
                themeId = DemoCatalogue.DinoDigTheme,
                themeDetail = "Fossil hunt",
                items = new[]
                {
                    new { catalogueItemId = DemoCatalogue.DinoDen, detail = "1:00–3:30 pm" },
                    new { catalogueItemId = DemoCatalogue.SweetRex, detail = "nut-free dino cake" },
                },
            })
            .Replies("Here’s a plan.");
        (conversationId, var turnId) = await amara.SendAsync("Plan it");
        await amara.WaitForTurnAsync(conversationId, turnId);
        proposalId = (await amara.LastGiddyMessageAsync()).GetProperty("proposal").GetProperty("id").GetGuid();
    }

    [Fact]
    public async Task Nothing_changes_until_the_parent_confirms()
    {
        var party = await LoadPartyAsync();

        Assert.Null(party.Theme);
        Assert.Empty(party.BookingsToDo);
    }

    [Fact]
    public async Task Confirming_sets_the_theme_bookings_to_do_budget_estimates_and_a_dated_checklist()
    {
        var response = await amara.Http.PostAsJsonAsync($"/api/parties/{dinoParty.Id}/plan", new { proposalId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var party = await LoadPartyAsync();
        Assert.Equal("Dino Dig", party.Theme);
        Assert.Equal([("Venue", "Dino Den Play Café", 340m), ("Cake", "Sweet Rex Bakery", 85m)],
            party.BookingsToDo.Select(b => (b.Category, b.Name, b.Estimate)));
        Assert.Equal(10, party.Checklist.Count);
        Assert.All(party.Checklist, task => Assert.True(task.Due <= party.Date));
        var saved = (await amara.LastGiddyMessageAsync()).GetProperty("text").GetString();
        Assert.Equal("Plan saved to Zuri’s Dino Dig 7th", saved);
    }

    [Fact]
    public async Task A_viewer_cannot_apply_a_plan()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);

        var response = await dev.PostAsJsonAsync($"/api/parties/{dinoParty.Id}/plan", new { proposalId });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Null((await LoadPartyAsync()).Theme);
    }

    [Fact]
    public async Task Another_familys_token_cannot_apply_a_plan()
    {
        using var stranger = await factory.CreateBrowserClientFor(TestParent.Stranger);

        var response = await stranger.PostAsJsonAsync($"/api/parties/{dinoParty.Id}/plan", new { proposalId });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Null((await LoadPartyAsync()).Theme);
    }

    [Fact]
    public async Task A_proposal_from_another_party_cannot_be_applied_and_nothing_changes()
    {
        var otherParty = TestData.DinoParty();
        await factory.SeedAsync(db => db.Parties.Add(otherParty));

        var response = await amara.Http.PostAsJsonAsync($"/api/parties/{otherParty.Id}/plan", new { proposalId });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Null(await factory.QueryAsync(db => db.Parties.Where(p => p.Id == otherParty.Id).Select(p => p.Theme).SingleAsync()));
    }

    private Task<Party> LoadPartyAsync() => factory.QueryAsync(db => db.Parties.SingleAsync(p => p.Id == dinoParty.Id));

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
