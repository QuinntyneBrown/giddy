using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Memories;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-023 and L2-024: browse themes for the child and choose one for the party.</summary>
public sealed class ThemeTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.Add(dinoParty);
        db.CatalogueItems.AddRange(DemoCatalogue.Items());
        db.Memories.Add(new Memory(Guid.NewGuid(), TestParent.Amara.Id, "Zuri loves dinosaurs, digging and science", Instant.FromUtc(2026, 10, 1, 12, 0)));
    });

    [Fact]
    public async Task Themes_for_the_childs_age_are_shown_by_default()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var themes = await amara.GetFromJsonAsync<JsonElement>($"/api/themes?partyId={dinoParty.Id}", Cancel);

        Assert.Equal(("Zuri", 7), (themes.GetProperty("child").GetProperty("name").GetString(), themes.GetProperty("child").GetProperty("age").GetInt32()));
        Assert.True(themes.GetProperty("forChild").GetBoolean());
        var results = themes.GetProperty("results").EnumerateArray().ToList();
        Assert.All(results, t => Assert.InRange(7, t.GetProperty("minAge").GetInt32(), t.GetProperty("maxAge").GetInt32()));
        Assert.DoesNotContain(results, t => t.GetProperty("name").GetString() == "Unicorn Rainbow");
        Assert.True(themes.GetProperty("total").GetInt32() > results.Count);
        var dino = results.Single(t => t.GetProperty("name").GetString() == "Dino Dig");
        Assert.Equal(("🦕", "Fossil hunt, volcano science and dino eggs."), (dino.GetProperty("emoji").GetString(), dino.GetProperty("description").GetString()));
    }

    [Fact]
    public async Task Themes_matching_the_childs_interests_are_tagged()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var themes = await amara.GetFromJsonAsync<JsonElement>($"/api/themes?partyId={dinoParty.Id}", Cancel);

        var results = themes.GetProperty("results").EnumerateArray().ToList();
        Assert.True(results.Single(t => t.GetProperty("name").GetString() == "Mad Science Lab").GetProperty("matchesInterests").GetBoolean());
        Assert.False(results.Single(t => t.GetProperty("name").GetString() == "Superhero City").GetProperty("matchesInterests").GetBoolean());
    }

    [Theory]
    [InlineData("ageBand=3-5", "Unicorn Rainbow", "Detective Mystery")]
    [InlineData("outdoor=true", "Pirate Adventure", "Mad Science Lab")]
    [InlineData("budget=true", "Superhero City", "Mad Science Lab")]
    public async Task Filters_narrow_the_themes(string filter, string included, string excluded)
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var themes = await amara.GetFromJsonAsync<JsonElement>($"/api/themes?partyId={dinoParty.Id}&forChild=false&{filter}", Cancel);

        var names = themes.GetProperty("results").EnumerateArray().Select(t => t.GetProperty("name").GetString()).ToList();
        Assert.Contains(included, names);
        Assert.DoesNotContain(excluded, names);
    }

    [Fact]
    public async Task Choosing_a_theme_returns_the_previous_one_for_undo()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var space = await ThemeIdAsync(amara, "Space Explorers");

        var response = await amara.PutAsJsonAsync(ThemeUrl, new { themeId = space }, Cancel);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Space Explorers", result.GetProperty("theme").GetString());
        Assert.Equal("Dino Dig", result.GetProperty("previous").GetProperty("name").GetString());
        var party = await factory.QueryAsync(db => db.Parties.SingleAsync(p => p.Id == dinoParty.Id, Cancel));
        Assert.Equal("Space Explorers", party.Theme);
        var themes = await amara.GetFromJsonAsync<JsonElement>($"/api/themes?partyId={dinoParty.Id}", Cancel);
        Assert.True(themes.GetProperty("results").EnumerateArray().Single(t => t.GetProperty("name").GetString() == "Space Explorers").GetProperty("chosen").GetBoolean());

        var undo = await amara.PutAsJsonAsync(ThemeUrl, new { themeId = result.GetProperty("previous").GetProperty("id").GetGuid() }, Cancel);

        Assert.Equal("Dino Dig", (await undo.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("theme").GetString());
    }

    [Fact]
    public async Task Undo_can_restore_having_no_theme()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var cleared = await amara.PutAsJsonAsync(ThemeUrl, new { themeId = (Guid?)null }, Cancel);

        Assert.Equal(JsonValueKind.Null, (await cleared.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("theme").ValueKind);
        Assert.Null((await factory.QueryAsync(db => db.Parties.SingleAsync(p => p.Id == dinoParty.Id, Cancel))).Theme);
    }

    [Fact]
    public async Task The_chosen_theme_drives_the_invitation_and_fun_and_food()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await amara.PutAsJsonAsync(ThemeUrl, new { themeId = await ThemeIdAsync(amara, "Space Explorers") }, Cancel);

        var invitation = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/invitation", Cancel);
        var vendors = await amara.GetFromJsonAsync<JsonElement>($"/api/vendors/search?partyId={dinoParty.Id}&category=entertainers", Cancel);

        Assert.Contains("Space Explorers", invitation.GetProperty("message").GetString());
        Assert.Equal("Space Explorers", vendors.GetProperty("theme").GetString());
    }

    [Fact]
    public async Task Viewers_cannot_change_the_theme_and_unknown_themes_are_not_found()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var viewer = await dev.PutAsJsonAsync(ThemeUrl, new { themeId = DemoCatalogue.SpaceTheme }, Cancel);
        var unknown = await amara.PutAsJsonAsync(ThemeUrl, new { themeId = Guid.NewGuid() }, Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, viewer.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, unknown.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private string ThemeUrl => $"/api/parties/{dinoParty.Id}/theme";

    private async Task<Guid> ThemeIdAsync(HttpClient client, string name) =>
        (await client.GetFromJsonAsync<JsonElement>($"/api/themes?partyId={dinoParty.Id}&forChild=false", Cancel))
            .GetProperty("results").EnumerateArray().Single(t => t.GetProperty("name").GetString() == name).GetProperty("id").GetGuid();
}
