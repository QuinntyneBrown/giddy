using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-045: the host hears about opens and replies while Giddy is open.</summary>
public sealed class LiveUpdatesTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan(confirmedBookings: 1);
    private Dictionary<string, string> tokens = [];
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.Add(dinoParty);
            db.Parties.Add(TestData.StrangersParty());
            db.Guests.AddRange(TestData.GuestsFor(dinoParty));
            db.CatalogueItems.AddRange(DemoCatalogue.Items());
        });
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.PostAsync($"/api/parties/{dinoParty.Id}/invitation/send", null, Cancel)).EnsureSuccessStatusCode();
        tokens = factory.Email.Sent.ToDictionary(e => e.To, e => Regex.Match(e.Body, "/rsvp/([A-Za-z0-9_-]+)").Groups[1].Value);
    }

    [Fact]
    public async Task The_host_hears_once_when_a_family_opens_the_invitation()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);
        var cursor = await CursorAsync(amara);
        using var guest = factory.CreateClient();

        await guest.GetAsync($"/api/rsvp/{tokens["lily.chen@example.com"]}", Cancel);
        await guest.GetAsync($"/api/rsvp/{tokens["lily.chen@example.com"]}", Cancel);

        var update = Assert.Single(await EventsAsync(amara, cursor));
        Assert.Equal(("opened", "info", "The Chen family opened the invitation"), (update.GetProperty("kind").GetString(), update.GetProperty("tone").GetString(), update.GetProperty("title").GetString()));
        Assert.Equal(dinoParty.Id, update.GetProperty("partyId").GetGuid());
    }

    [Fact]
    public async Task A_reply_with_a_new_allergy_is_a_warning_offering_to_share_the_list()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);
        var cursor = await CursorAsync(amara);
        using var guest = factory.CreateClient();

        await guest.PutAsJsonAsync($"/api/rsvp/{tokens["priya.patel@example.com"]}", Reply(true, "Peanut"), Cancel);

        var updates = await EventsAsync(amara, cursor);
        Assert.Equal(["replied", "allergy"], updates.Select(u => u.GetProperty("kind").GetString()));
        var replied = updates[0];
        Assert.Equal(("success", "Arjun is coming!"), (replied.GetProperty("tone").GetString(), replied.GetProperty("title").GetString()));
        Assert.Equal("Priya Patel replied. 1 coming so far.", replied.GetProperty("text").GetString());
        var allergy = updates[1];
        Assert.Equal(("warning", "New allergy: peanut"), (allergy.GetProperty("tone").GetString(), allergy.GetProperty("title").GetString()));
        Assert.Equal("Priya Patel says Arjun has a peanut allergy. Let Dino Den Play Café know.", allergy.GetProperty("text").GetString());
        Assert.Equal(("Share with Dino Den Play Café", "share-allergies"), (allergy.GetProperty("action").GetProperty("label").GetString(), allergy.GetProperty("action").GetProperty("kind").GetString()));
    }

    [Fact]
    public async Task A_changed_reply_tells_the_host()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);
        using var guest = factory.CreateClient();
        await guest.PutAsJsonAsync($"/api/rsvp/{tokens["lily.chen@example.com"]}", Reply(true, null), Cancel);
        var cursor = await CursorAsync(amara);

        await guest.PutAsJsonAsync($"/api/rsvp/{tokens["lily.chen@example.com"]}", Reply(false, null), Cancel);

        var update = Assert.Single(await EventsAsync(amara, cursor));
        Assert.Equal(("changed", "info", "Lily Chen changed their reply"), (update.GetProperty("kind").GetString(), update.GetProperty("tone").GetString(), update.GetProperty("title").GetString()));
        Assert.Equal("Maya can’t come now.", update.GetProperty("text").GetString());
    }

    [Fact]
    public async Task Parents_only_hear_about_their_own_parties()
    {
        using var stranger = factory.CreateClientFor(TestParent.Stranger);
        using var dev = factory.CreateClientFor(TestParent.Dev);
        var strangerCursor = await CursorAsync(stranger);
        var devCursor = await CursorAsync(dev);
        using var guest = factory.CreateClient();

        await guest.GetAsync($"/api/rsvp/{tokens["lily.chen@example.com"]}", Cancel);

        Assert.Empty(await EventsAsync(stranger, strangerCursor));
        Assert.Single(await EventsAsync(dev, devCursor));
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private async Task<long> CursorAsync(HttpClient client)
    {
        var first = await client.GetFromJsonAsync<JsonElement>("/api/live-updates", Cancel);
        Assert.Equal(0, first.GetProperty("events").GetArrayLength());
        return first.GetProperty("cursor").GetInt64();
    }

    private async Task<List<JsonElement>> EventsAsync(HttpClient client, long cursor) =>
        (await client.GetFromJsonAsync<JsonElement>($"/api/live-updates?after={cursor}", Cancel)).GetProperty("events").EnumerateArray().ToList();

    private static object Reply(bool coming, string? allergies) => new
    {
        coming,
        allergies,
        parentStaying = true,
        parentName = coming && allergies is not null ? "Priya Patel" : "Lily Chen",
    };
}
