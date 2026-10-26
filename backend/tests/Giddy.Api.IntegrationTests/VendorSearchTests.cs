using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-032 and L2-033: entertainers, activities, food and cake for the party.</summary>
public sealed class VendorSearchTests : IAsyncLifetime
{
    private static readonly Instant Earlier = Instant.FromUtc(2026, 10, 21, 12, 0);
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        var guests = TestData.GuestsFor(dinoParty);
        foreach (var guest in guests)
        {
            guest.Invite($"hash-{guest.ChildFirstName}", "unused", Earlier);
        }

        guests[0].Reply(true, "Dairy-free (lactose intolerant)", true, null, "Lily Chen", null, null, Earlier);
        guests[1].Reply(true, "Peanut (EpiPen with parent)", true, null, "Priya Patel", null, null, Earlier);
        guests[2].Reply(false, "Gluten-free", null, null, "Marco Rossi", null, null, Earlier);
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.Add(dinoParty);
            db.Parties.Add(TestData.StrangersParty());
            db.Guests.AddRange(guests);
            db.CatalogueItems.AddRange(DemoCatalogue.Items());
        });
    }

    [Fact]
    public async Task Entertainers_free_on_the_date_who_travel_to_the_party_are_listed_with_their_details()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var search = await SearchAsync(amara, "entertainers", theme: "off");

        var names = Names(search);
        Assert.Contains("Professor Fizz’s Volcano Lab", names);
        Assert.Contains("DJ Dance Party Dan", names);
        Assert.DoesNotContain("Bubble Bianca", names);
        Assert.DoesNotContain("Mississauga Magic Max", names);
        Assert.DoesNotContain("Sweet Rex Bakery", names);
        var fizz = Result(search, "Professor Fizz’s Volcano Lab");
        Assert.Equal(("🧪", 195m, 4.9m, 187), (fizz.GetProperty("emoji").GetString(), fizz.GetProperty("price").GetDecimal(), fizz.GetProperty("rating").GetDecimal(), fizz.GetProperty("reviewCount").GetInt32()));
        Assert.Equal((45, 4, 10), (fizz.GetProperty("durationMinutes").GetInt32(), fizz.GetProperty("minAge").GetInt32(), fizz.GetProperty("maxAge").GetInt32()));
        Assert.Equal("Leslieville", search.GetProperty("place").GetString());
        Assert.Equal("2026-11-14", search.GetProperty("date").GetString());
    }

    [Fact]
    public async Task The_partys_theme_filter_is_on_by_default_and_can_be_turned_off()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var themed = await SearchAsync(amara, "entertainers");
        var all = await SearchAsync(amara, "entertainers", theme: "off");

        Assert.Equal("Dino Dig", themed.GetProperty("theme").GetString());
        Assert.True(themed.GetProperty("themeOn").GetBoolean());
        Assert.DoesNotContain("DJ Dance Party Dan", Names(themed));
        Assert.Contains("Rexy the Dino Visit", Names(themed));
        Assert.False(all.GetProperty("themeOn").GetBoolean());
        Assert.True(Names(all).Count > Names(themed).Count);
    }

    [Fact]
    public async Task Vendors_already_in_the_plan_show_their_status()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var search = await SearchAsync(amara, "entertainers");

        Assert.Equal("inYourPlan", Result(search, "Professor Fizz’s Volcano Lab").GetProperty("planStatus").GetString());
        Assert.Equal(JsonValueKind.Null, Result(search, "Rexy the Dino Visit").GetProperty("planStatus").ValueKind);
    }

    [Fact]
    public async Task Food_and_cake_lists_the_allergies_by_child_and_whether_each_vendor_can_meet_them()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var search = await SearchAsync(amara, "food", theme: "off");

        var allergies = search.GetProperty("allergies").EnumerateArray()
            .Select(a => (a.GetProperty("allergen").GetString(), string.Join(",", a.GetProperty("children").EnumerateArray().Select(c => c.GetString()))))
            .ToList();
        Assert.Equal([("dairy", "Maya"), ("peanut", "Arjun")], allergies);
        Assert.Contains("Sweet Rex Bakery", Names(search));
        Assert.Contains("Pizza Nonna", Names(search));
        var cakeCorner = Result(search, "Cake Corner");
        Assert.Equal([("dairy", false), ("peanut", false)], Fit(cakeCorner));
        Assert.Equal([("dairy", true), ("peanut", true)], Fit(Result(search, "Popsicle Parade")));
        Assert.Contains("vegan", Result(search, "Cupcake Cloud").GetProperty("dietary").EnumerateArray().Select(d => d.GetString()));
        Assert.Equal(2, Result(search, "Cupcake Cloud").GetProperty("noticeDays").GetInt32());
    }

    [Fact]
    public async Task Filters_that_match_nothing_say_what_to_change()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var search = await SearchAsync(amara, "entertainers", maxPrice: 100);

        Assert.Equal(0, search.GetProperty("results").GetArrayLength());
        var noResults = search.GetProperty("noResults");
        Assert.Equal(["under $100", "for the Dino Dig theme"], noResults.GetProperty("conflicts").EnumerateArray().Select(c => c.GetString()));
        Assert.Equal("Raise to $150", noResults.GetProperty("suggestion").GetProperty("label").GetString());
    }

    [Fact]
    public async Task Another_familys_party_cannot_be_searched_for()
    {
        using var stranger = factory.CreateClientFor(TestParent.Stranger);

        var response = await stranger.GetAsync($"/api/vendors/search?partyId={dinoParty.Id}&category=entertainers", Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private async Task<JsonElement> SearchAsync(HttpClient client, string category, string? theme = null, int? maxPrice = null)
    {
        var url = $"/api/vendors/search?partyId={dinoParty.Id}&category={category}"
            + (theme is null ? string.Empty : $"&theme={theme}")
            + (maxPrice is null ? string.Empty : $"&maxPrice={maxPrice}");
        return await client.GetFromJsonAsync<JsonElement>(url, Cancel);
    }

    private static List<string> Names(JsonElement search) =>
        search.GetProperty("results").EnumerateArray().Select(r => r.GetProperty("name").GetString()!).ToList();

    private static JsonElement Result(JsonElement search, string name) =>
        search.GetProperty("results").EnumerateArray().Single(r => r.GetProperty("name").GetString() == name);

    private static List<(string?, bool)> Fit(JsonElement vendor) =>
        vendor.GetProperty("allergyFit").EnumerateArray().Select(f => (f.GetProperty("allergen").GetString(), f.GetProperty("ok").GetBoolean())).ToList();
}
