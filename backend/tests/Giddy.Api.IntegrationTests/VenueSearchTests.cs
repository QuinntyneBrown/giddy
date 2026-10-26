using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Application.Venues;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-025 and L2-090: searching venues by availability, fit, distance and features.</summary>
public sealed class VenueSearchTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty();
    private HttpClient amara = null!;
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.Add(dinoParty);
            db.CatalogueItems.AddRange(DemoCatalogue.Items());
        });
        amara = factory.CreateClientFor(TestParent.Amara);
    }

    private async Task<JsonElement> SearchAsync(string extra = "")
    {
        var url = $"/api/venues/search?partyId={dinoParty.Id}&date=2026-11-14&guests=16&radiusKm=10{extra}";
        return await amara.GetFromJsonAsync<JsonElement>(url, Cancel);
    }

    private static List<string> Names(JsonElement search) =>
        search.GetProperty("results").EnumerateArray().Select(r => r.GetProperty("name").GetString()!).ToList();

    [Fact]
    public async Task Lists_venues_free_on_the_date_that_fit_and_are_within_the_distance()
    {
        var search = await SearchAsync();

        Assert.Equal("Leslieville", search.GetProperty("area").GetString());
        Assert.Equal(
            ["Beaches Art Loft", "Beaches Play Loft", "Bounce Borough", "Dino Den Play Café", "Junction Science Hub", "Little Diggers Sandbox Studio", "Maple Climb Kids"],
            Names(search).Order());
        Assert.DoesNotContain("Danforth Party Room", Names(search));
        Assert.DoesNotContain("Tiny Hall", Names(search));
        Assert.DoesNotContain("Mississauga Fun Zone", Names(search));
    }

    [Fact]
    public async Task Each_result_shows_what_a_parent_needs_to_choose()
    {
        var dino = (await SearchAsync()).GetProperty("results").EnumerateArray().Single(r => r.GetProperty("name").GetString() == "Dino Den Play Café");

        Assert.Equal("Leslieville", dino.GetProperty("neighbourhood").GetString());
        Assert.Equal(1.1, dino.GetProperty("distanceKm").GetDouble(), 1);
        Assert.Equal(20, dino.GetProperty("capacity").GetInt32());
        Assert.Equal((3, 9), (dino.GetProperty("minAge").GetInt32(), dino.GetProperty("maxAge").GetInt32()));
        Assert.Equal((4.8m, 212), (dino.GetProperty("rating").GetDecimal(), dino.GetProperty("reviewCount").GetInt32()));
        Assert.Equal(340m, dino.GetProperty("price").GetDecimal());
        Assert.Equal(150, dino.GetProperty("durationMinutes").GetInt32());
        Assert.Contains("Nut-free kitchen", dino.GetProperty("features").EnumerateArray().Select(f => f.GetString()));
        Assert.Equal(["13:00", "16:00"], dino.GetProperty("freeSlots").EnumerateArray().Select(s => s.GetProperty("start").GetString()!));
        Assert.Equal(JsonValueKind.Null, dino.GetProperty("fitWarning").ValueKind);
    }

    [Fact]
    public async Task A_venue_a_little_too_small_is_listed_with_a_warning()
    {
        var diggers = (await SearchAsync()).GetProperty("results").EnumerateArray().Single(r => r.GetProperty("name").GetString() == "Little Diggers Sandbox Studio");

        Assert.Equal("Fits 15; you invited 16", diggers.GetProperty("fitWarning").GetString());
    }

    [Theory]
    [InlineData("&nutFree=true", new[] { "Dino Den Play Café", "Junction Science Hub" })]
    [InlineData("&maxPrice=300", new[] { "Beaches Art Loft", "Beaches Play Loft", "Little Diggers Sandbox Studio" })]
    [InlineData("&parking=true", new[] { "Bounce Borough", "Dino Den Play Café", "Maple Climb Kids" })]
    [InlineData("&stepFree=true", new[] { "Bounce Borough", "Dino Den Play Café", "Junction Science Hub", "Little Diggers Sandbox Studio" })]
    public async Task Filters_narrow_the_results(string filter, string[] expected)
    {
        var search = await SearchAsync(filter);

        Assert.Equal(expected, Names(search).Order());
    }

    [Theory]
    [InlineData("closest", "Dino Den Play Café")]
    [InlineData("price", "Beaches Art Loft")]
    [InlineData("rating", "Junction Science Hub")]
    public async Task Sorting_reorders_the_results(string sort, string first)
    {
        var search = await SearchAsync($"&sort={sort}");

        Assert.Equal(first, Names(search)[0]);
    }

    [Fact]
    public async Task No_results_name_the_conflicting_filters_and_a_relaxation_that_works()
    {
        var search = await SearchAsync("&maxPrice=250&nutFree=true");

        Assert.Empty(search.GetProperty("results").EnumerateArray());
        var hint = search.GetProperty("noResults");
        Assert.Equal(["under $250", "with a nut-free kitchen"], hint.GetProperty("conflicts").EnumerateArray().Select(c => c.GetString()!));
        var suggestion = hint.GetProperty("suggestion");
        Assert.Equal("Raise to $340", suggestion.GetProperty("label").GetString());
        Assert.Equal(("maxPrice", "340", 1), (suggestion.GetProperty("filter").GetString(), suggestion.GetProperty("value").GetString(), suggestion.GetProperty("count").GetInt32()));
    }

    [Fact]
    public async Task A_timed_out_availability_service_is_explained()
    {
        using var failing = factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.RemoveAll<IVenueAvailability>();
            services.AddSingleton<IVenueAvailability, TimingOutAvailability>();
        }));
        using var client = failing.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.Header, TestParent.Amara.HeaderValue);

        var response = await client.GetAsync($"/api/venues/search?partyId={dinoParty.Id}&date=2026-11-14&guests=16&radiusKm=10", Cancel);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Contains("availability", problem.GetProperty("title").GetString());
    }

    [Fact]
    public async Task Postal_codes_outside_the_GTA_get_an_explanation_and_no_venues()
    {
        var search = await amara.GetFromJsonAsync<JsonElement>("/api/venues/search?postalCode=K1A%200B1&date=2026-11-14&guests=16&radiusKm=10", Cancel);

        Assert.True(search.GetProperty("outsideServiceArea").GetBoolean());
        Assert.Empty(search.GetProperty("results").EnumerateArray());
    }

    [Fact]
    public async Task Another_familys_party_cannot_be_used_for_a_search()
    {
        using var stranger = factory.CreateClientFor(TestParent.Stranger);

        var response = await stranger.GetAsync($"/api/venues/search?partyId={dinoParty.Id}&date=2026-11-14&guests=16&radiusKm=10", Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Invalid_search_input_is_rejected()
    {
        var response = await amara.GetAsync($"/api/venues/search?partyId={dinoParty.Id}&date=not-a-date&guests=0&radiusKm=10", Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
