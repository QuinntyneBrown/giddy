using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-010: creating a party plan from the basics.</summary>
public sealed class CreatePartyTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private HttpClient amara = null!;
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        await factory.SeedAsync(TestData.AddPeople);
        amara = await factory.CreateBrowserClientFor(TestParent.Amara);
    }

    private static object Basics(object? overrides = null)
    {
        var basics = new Dictionary<string, object?>
        {
            ["childId"] = TestData.Zuri,
            ["date"] = "2026-11-14",
            ["guests"] = 16,
            ["timeOfDay"] = "afternoon",
            ["budget"] = 800,
            ["postalCode"] = "M4M 1H1",
        };
        if (overrides is not null)
        {
            foreach (var property in JsonSerializer.SerializeToElement(overrides).EnumerateObject())
            {
                basics[property.Name] = property.Value;
            }
        }

        return basics;
    }

    [Fact]
    public async Task A_party_for_a_child_is_created_with_the_parent_as_owner()
    {
        var response = await amara.PostAsJsonAsync("/api/parties", Basics(), Cancel);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Zuri’s 7th birthday", created.GetProperty("name").GetString());
        Assert.Equal("owner", created.GetProperty("role").GetString());
        Assert.Equal("13:00", created.GetProperty("startsAt").GetString());
        Assert.Equal("15:30", created.GetProperty("endsAt").GetString());
        var party = await factory.QueryAsync(db => db.Parties.SingleAsync(Cancel));
        Assert.Equal(TestData.Zuri, party.ChildId);
        Assert.Equal(7, party.TurningAge);
        Assert.Equal(16, party.GuestCount);
        Assert.Equal(800m, party.Budget);
        Assert.Equal("Leslieville", party.Area!.Name);
        Assert.Equal(10, party.Area.SearchRadiusKm);
    }

    [Fact]
    public async Task A_party_for_someone_else_uses_their_name_and_age()
    {
        var response = await amara.PostAsJsonAsync("/api/parties", Basics(new { childId = (Guid?)null, childName = "Maya", turningAge = 5, timeOfDay = "morning" }), Cancel);

        var created = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Maya’s 5th birthday", created.GetProperty("name").GetString());
        Assert.Equal("10:00", created.GetProperty("startsAt").GetString());
    }

    [Theory]
    [InlineData("2026-10-25", 16, "date")]
    [InlineData("2026-10-20", 16, "date")]
    [InlineData("2026-11-14", 0, "guests")]
    [InlineData("2026-11-14", 61, "guests")]
    public async Task Same_day_or_past_dates_and_guest_counts_outside_1_to_60_are_rejected(string date, int guests, string field)
    {
        var response = await amara.PostAsJsonAsync("/api/parties", Basics(new { date, guests }), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.True(problem.GetProperty("errors").TryGetProperty(field, out _));
        Assert.Equal(0, await factory.QueryAsync(db => db.Parties.CountAsync(Cancel)));
    }

    [Fact]
    public async Task Someone_else_needs_a_name_and_an_invalid_postal_code_is_rejected()
    {
        var response = await amara.PostAsJsonAsync("/api/parties", Basics(new { childId = (Guid?)null, postalCode = "12345" }), Cancel);

        var errors = (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("errors");
        Assert.True(errors.TryGetProperty("childName", out _));
        Assert.True(errors.TryGetProperty("postalCode", out _));
    }

    [Fact]
    public async Task Another_familys_child_cannot_be_chosen()
    {
        using var stranger = await factory.CreateBrowserClientFor(TestParent.Stranger);

        var response = await stranger.PostAsJsonAsync("/api/parties", Basics(), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(0, await factory.QueryAsync(db => db.Parties.CountAsync(Cancel)));
    }

    [Fact]
    public async Task The_family_gives_each_childs_next_birthday_and_the_postal_code_area()
    {
        var family = await amara.GetFromJsonAsync<JsonElement>("/api/family", Cancel);

        Assert.Equal("M4M 1H1", family.GetProperty("postalCode").GetString());
        Assert.Equal("Leslieville", family.GetProperty("areaName").GetString());
        var children = family.GetProperty("children").EnumerateArray().ToList();
        Assert.Equal(("Zuri", "2026-11-14", 7), (children[0].GetProperty("firstName").GetString(), children[0].GetProperty("nextBirthday").GetString(), children[0].GetProperty("turningAge").GetInt32()));
        Assert.Equal(("Kofi", "2027-02-03", 4), (children[1].GetProperty("firstName").GetString(), children[1].GetProperty("nextBirthday").GetString(), children[1].GetProperty("turningAge").GetInt32()));
    }

    [Fact]
    public async Task The_budget_guide_gives_a_typical_range_for_the_guest_count()
    {
        var guide = await amara.GetFromJsonAsync<JsonElement>("/api/budget-guide?guests=16", Cancel);

        Assert.Equal(600m, guide.GetProperty("low").GetDecimal());
        Assert.Equal(1100m, guide.GetProperty("high").GetDecimal());
    }

    [Fact]
    public async Task A_new_party_gets_its_own_conversation_with_Giddy()
    {
        var created = await (await amara.PostAsJsonAsync("/api/parties", Basics(), Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);
        var partyId = created.GetProperty("id").GetGuid();

        var conversation = await (await amara.PostAsync($"/api/parties/{partyId}/conversations", null, Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);
        using var stranger = await factory.CreateBrowserClientFor(TestParent.Stranger);
        var strangers = await stranger.PostAsync($"/api/parties/{partyId}/conversations", null, Cancel);

        Assert.Equal(partyId, conversation.GetProperty("party").GetProperty("partyId").GetGuid());
        Assert.Equal(HttpStatusCode.NotFound, strangers.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
