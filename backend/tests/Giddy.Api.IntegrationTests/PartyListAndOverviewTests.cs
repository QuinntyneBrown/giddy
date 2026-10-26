using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-011 and L2-012: My parties and the party overview.</summary>
public sealed class PartyListAndOverviewTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan(doneTasks: 3, confirmedBookings: 1);
    private readonly Party kofisDraft = Party.Plan(Guid.NewGuid(), "Kofi’s 4th: Choo-Choo Express", new LocalDate(2027, 2, 3), new LocalTime(10, 0), new LocalTime(12, 0), TestParent.Amara.Id);
    private readonly Party lastYear = Party.Plan(Guid.NewGuid(), "Zuri’s 6th: Mermaid Splash", new LocalDate(2025, 11, 15), new LocalTime(13, 0), new LocalTime(15, 0), TestParent.Amara.Id);
    private HttpClient amara = null!;
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.AddRange(dinoParty, kofisDraft, lastYear);
        });
        amara = factory.CreateClientFor(TestParent.Amara);
    }

    [Fact]
    public async Task Parties_are_grouped_into_upcoming_drafts_and_past_with_readiness()
    {
        var parties = (await amara.GetFromJsonAsync<JsonElement>("/api/parties", Cancel)).EnumerateArray().ToList();

        Assert.Equal(["past", "upcoming", "draft"], parties.Select(p => p.GetProperty("status").GetString()!));
        var dino = parties[1];
        Assert.Equal(27, dino.GetProperty("readiness").GetInt32());
        Assert.Equal("Dino Den Play Café", dino.GetProperty("venueName").GetString());
        Assert.Equal("Dino Dig", dino.GetProperty("theme").GetString());
        Assert.True(parties[0].GetProperty("locked").GetBoolean());
    }

    [Fact]
    public async Task The_overview_shows_the_plan_at_a_glance()
    {
        var overview = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/overview", Cancel);

        Assert.Equal(20, overview.GetProperty("daysToGo").GetInt32());
        Assert.Equal("Dino Den Play Café", overview.GetProperty("venueName").GetString());
        Assert.Equal(27, overview.GetProperty("readiness").GetInt32());
        Assert.Equal(3, overview.GetProperty("doneTasks").GetInt32());
        Assert.Equal(10, overview.GetProperty("totalTasks").GetInt32());
        var next = overview.GetProperty("nextTasks").EnumerateArray().ToList();
        Assert.Equal(["Order the cake", "Share the allergy list with the venue", "Order loot bags"], next.Select(t => t.GetProperty("title").GetString()!));
        Assert.Equal(["peanut"], overview.GetProperty("allergies").EnumerateArray().Select(a => a.GetString()!));
        Assert.Equal(("Zuri", 7), (overview.GetProperty("childName").GetString(), overview.GetProperty("turningAge").GetInt32()));
        Assert.Equal(800m, overview.GetProperty("budget").GetDecimal());
        Assert.Equal(778m, overview.GetProperty("planned").GetDecimal());
        var members = overview.GetProperty("members").EnumerateArray().ToList();
        Assert.Equal([("Amara Okafor", "owner"), ("Kemi Okafor", "coPlanner"), ("Dev Patel", "viewer")],
            members.Select(m => (m.GetProperty("name").GetString()!, m.GetProperty("role").GetString()!)));
        Assert.True(overview.GetProperty("canDelete").GetBoolean());
        Assert.False(overview.GetProperty("locked").GetBoolean());
    }

    [Fact]
    public async Task Overdue_tasks_are_flagged_in_the_next_tasks()
    {
        await factory.SeedAsync(db => db.Parties.Single(p => p.Id == dinoParty.Id).WithPlan(doneTasks: 1));

        var overview = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/overview", Cancel);

        var next = overview.GetProperty("nextTasks").EnumerateArray().First();
        Assert.Equal("Book the entertainer", next.GetProperty("title").GetString());
        Assert.True(next.GetProperty("overdue").GetBoolean());
        Assert.Equal("2026-10-20", next.GetProperty("due").GetString());
    }

    [Fact]
    public async Task Booking_statuses_load_separately_with_prices()
    {
        var bookings = (await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/bookings", Cancel)).EnumerateArray().ToList();

        Assert.Equal(5, bookings.Count);
        Assert.Equal(("Venue", "Dino Den Play Café", 340m, "confirmed"),
            (bookings[0].GetProperty("category").GetString(), bookings[0].GetProperty("name").GetString(), bookings[0].GetProperty("price").GetDecimal(), bookings[0].GetProperty("status").GetString()));
        Assert.Equal("toBook", bookings[1].GetProperty("status").GetString());
    }

    [Fact]
    public async Task Co_planners_cannot_delete_and_strangers_cannot_see_the_overview()
    {
        using var kemi = factory.CreateClientFor(TestParent.Kemi);
        using var stranger = factory.CreateClientFor(TestParent.Stranger);

        var kemis = await kemi.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/overview", Cancel);
        var strangers = await stranger.GetAsync($"/api/parties/{dinoParty.Id}/overview", Cancel);
        var strangersBookings = await stranger.GetAsync($"/api/parties/{dinoParty.Id}/bookings", Cancel);

        Assert.False(kemis.GetProperty("canDelete").GetBoolean());
        Assert.Equal(HttpStatusCode.NotFound, strangers.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, strangersBookings.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
