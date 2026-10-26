using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-026 and L2-027: venue details, slots, favourites, waitlist and comparison.</summary>
public sealed class VenueDetailAndCompareTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.Add(dinoParty);
        db.CatalogueItems.AddRange(DemoCatalogue.Items());
    });

    [Fact]
    public async Task A_venue_shows_its_details_and_the_slots_on_the_party_date()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var venue = await amara.GetFromJsonAsync<JsonElement>($"/api/venues/{DemoCatalogue.DinoDen}?date=2026-11-14&partyId={dinoParty.Id}", Cancel);

        Assert.Equal("Dino Den Play Café", venue.GetProperty("name").GetString());
        Assert.Equal("1124 Queen St E", venue.GetProperty("address").GetString());
        Assert.Equal(1.1, venue.GetProperty("distanceKm").GetDouble(), 1);
        Assert.StartsWith("A dinosaur-themed play café", venue.GetProperty("description").GetString());
        Assert.Equal(4, venue.GetProperty("includes").GetArrayLength());
        Assert.Equal("Dino egg hunt", venue.GetProperty("addOns")[0].GetProperty("name").GetString());
        Assert.Equal("Rania H.", venue.GetProperty("reviews")[0].GetProperty("author").GetString());
        var slots = venue.GetProperty("slots").EnumerateArray().ToList();
        Assert.Equal([("10:00", true), ("13:00", false), ("16:00", false)], slots.Select(s => (s.GetProperty("start").GetString()!, s.GetProperty("booked").GetBoolean())));
        Assert.Equal("13:00", venue.GetProperty("selectedSlot").GetString());
        Assert.False(venue.GetProperty("fullyBooked").GetBoolean());
    }

    [Fact]
    public async Task A_fully_booked_date_offers_the_nearest_free_date_and_a_similar_free_venue()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var venue = await amara.GetFromJsonAsync<JsonElement>($"/api/venues/{DemoCatalogue.DanforthPartyRoom}?date=2026-11-14&partyId={dinoParty.Id}", Cancel);

        Assert.True(venue.GetProperty("fullyBooked").GetBoolean());
        var nearest = venue.GetProperty("nearestFreeDate");
        Assert.Equal(("2026-11-15", "10:00"), (nearest.GetProperty("date").GetString(), nearest.GetProperty("start").GetString()));
        var similar = venue.GetProperty("similarVenue");
        Assert.Equal(DemoCatalogue.DinoDen, similar.GetProperty("id").GetGuid());
        Assert.Equal("13:00", similar.GetProperty("start").GetString());
    }

    [Fact]
    public async Task Favourites_are_saved_for_the_family()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        using var stranger = factory.CreateClientFor(TestParent.Stranger);

        var saved = await amara.PutAsJsonAsync($"/api/venues/{DemoCatalogue.DinoDen}/favourite", new { favourite = true }, Cancel);
        var mine = await amara.GetFromJsonAsync<JsonElement>($"/api/venues/{DemoCatalogue.DinoDen}?date=2026-11-14", Cancel);
        var theirs = await stranger.GetFromJsonAsync<JsonElement>($"/api/venues/{DemoCatalogue.DinoDen}?date=2026-11-14", Cancel);

        Assert.Equal(HttpStatusCode.NoContent, saved.StatusCode);
        Assert.True(mine.GetProperty("favourite").GetBoolean());
        Assert.False(theirs.GetProperty("favourite").GetBoolean());
    }

    [Fact]
    public async Task A_parent_can_ask_to_hear_when_a_slot_opens()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync($"/api/venues/{DemoCatalogue.DanforthPartyRoom}/waitlist", new { date = "2026-11-14", partyId = dinoParty.Id }, Cancel);

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        Assert.Equal(1, await factory.QueryAsync(db => db.VenueWaitlist.CountAsync(w => w.VenueId == DemoCatalogue.DanforthPartyRoom && w.FamilyId == TestParent.Amara.Id, Cancel)));
    }

    [Fact]
    public async Task Comparing_venues_highlights_the_best_in_each_row_and_recommends_one()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);
        var ids = string.Join(",", DemoCatalogue.DinoDen, DemoCatalogue.MapleClimb, DemoCatalogue.JunctionScienceHub);

        var comparison = await amara.GetFromJsonAsync<JsonElement>($"/api/venues/compare?ids={ids}&date=2026-11-14&partyId={dinoParty.Id}", Cancel);

        Assert.Equal(["Dino Den Play Café", "Maple Climb Kids", "Junction Science Hub"], comparison.GetProperty("venues").EnumerateArray().Select(v => v.GetProperty("name").GetString()!));
        var rows = comparison.GetProperty("rows").EnumerateArray().ToDictionary(r => r.GetProperty("label").GetString()!, r => r.GetProperty("cells").EnumerateArray().ToList());
        Assert.True(rows["Price"][0].GetProperty("best").GetBoolean());
        Assert.Equal("$340 for 2.5 h", rows["Price"][0].GetProperty("text").GetString());
        Assert.True(rows["Fits"][2].GetProperty("best").GetBoolean());
        Assert.True(rows["Distance"][0].GetProperty("best").GetBoolean());
        Assert.True(rows["Rating"][2].GetProperty("best").GetBoolean());
        Assert.Equal("Yes", rows["Nut-free kitchen"][0].GetProperty("text").GetString());
        Assert.Equal("Dino theme room", rows["Theme fit"][0].GetProperty("text").GetString());
        var pick = comparison.GetProperty("recommendation");
        Assert.Equal(DemoCatalogue.DinoDen, pick.GetProperty("venueId").GetGuid());
        Assert.Contains("cheapest", pick.GetProperty("reason").GetString(), StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(4)]
    public async Task Comparisons_need_two_or_three_venues(int count)
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);
        var all = new[] { DemoCatalogue.DinoDen, DemoCatalogue.MapleClimb, DemoCatalogue.JunctionScienceHub, DemoCatalogue.BounceBorough };

        var response = await amara.GetAsync($"/api/venues/compare?ids={string.Join(",", all.Take(count))}&date=2026-11-14", Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
