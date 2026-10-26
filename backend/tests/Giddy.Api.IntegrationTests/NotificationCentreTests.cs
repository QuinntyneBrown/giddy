using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Notifications;
using Giddy.Domain.Parties;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-055 and L2-060: the notification centre, and planners hearing about each other's changes.</summary>
public sealed class NotificationCentreTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party party = TestData.DinoParty().WithPlan(confirmedBookings: 1);
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.Add(party);
        db.Guests.AddRange(TestData.GuestsFor(party));
        var now = factory.Clock.GetCurrentInstant();
        db.InboxItems.AddRange(
            new InboxItem(TestParent.Amara.Id, "✅", "Dino Den confirmed your booking", "Sat 14 Nov, 1:00–3:30 pm.", $"/parties/{party.Id}", now - Duration.FromDays(8)),
            new InboxItem(TestParent.Amara.Id, "💌", "Lily Chen replied: Maya is coming!", "Maya is dairy-free.", $"/parties/{party.Id}/guests", now - Duration.FromHours(2)),
            new InboxItem(TestParent.Amara.Id, "🧹", "An old note", "From months ago.", "/", now - Duration.FromDays(91)));
    });

    [Fact]
    public async Task Unread_come_first_then_earlier_and_nothing_older_than_ninety_days()
    {
        await factory.SeedAsync(db => db.InboxItems.Single(i => i.Title.StartsWith("Dino Den", StringComparison.Ordinal)).MarkRead(factory.Clock.GetCurrentInstant()));
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var centre = await amara.GetFromJsonAsync<JsonElement>("/api/notifications", Cancel);

        Assert.Equal(1, centre.GetProperty("unread").GetInt32());
        var items = centre.GetProperty("items").EnumerateArray().ToList();
        Assert.Equal(["Lily Chen replied: Maya is coming!", "Dino Den confirmed your booking"], items.Select(i => i.GetProperty("title").GetString()));
        Assert.Equal((false, true), (items[0].GetProperty("read").GetBoolean(), items[1].GetProperty("read").GetBoolean()));
        Assert.Equal(("💌", $"/parties/{party.Id}/guests"), (items[0].GetProperty("icon").GetString(), items[0].GetProperty("link").GetString()));
    }

    [Fact]
    public async Task Opening_one_marks_it_read_and_mark_all_reads_the_rest()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var items = (await amara.GetFromJsonAsync<JsonElement>("/api/notifications", Cancel)).GetProperty("items").EnumerateArray().ToList();

        await amara.PostAsync($"/api/notifications/{items[0].GetProperty("id").GetGuid()}/read", null, Cancel);
        var afterOne = await amara.GetFromJsonAsync<JsonElement>("/api/notifications/unread-count", Cancel);
        await amara.PostAsync("/api/notifications/read-all", null, Cancel);
        var afterAll = await amara.GetFromJsonAsync<JsonElement>("/api/notifications/unread-count", Cancel);

        Assert.Equal((1, 0), (afterOne.GetProperty("unread").GetInt32(), afterAll.GetProperty("unread").GetInt32()));
    }

    [Fact]
    public async Task Nobody_can_read_another_parents_notifications()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);
        var item = (await amara.GetFromJsonAsync<JsonElement>("/api/notifications", Cancel)).GetProperty("items")[0];

        var read = await kemi.PostAsync($"/api/notifications/{item.GetProperty("id").GetGuid()}/read", null, Cancel);

        Assert.Equal(HttpStatusCode.NotFound, read.StatusCode);
        Assert.Empty((await kemi.GetFromJsonAsync<JsonElement>("/api/notifications", Cancel)).GetProperty("items").EnumerateArray());
    }

    [Fact]
    public async Task Other_planners_hear_who_changed_the_budget_or_sent_the_invitations()
    {
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);
        using var amara = factory.CreateClientFor(TestParent.Amara);
        using var dev = factory.CreateClientFor(TestParent.Dev);

        await kemi.PostAsJsonAsync($"/api/parties/{party.Id}/budget/lines", new { description = "Balloon arch", category = "Decorations", amount = 40m, paid = false }, Cancel);
        await kemi.PostAsync($"/api/parties/{party.Id}/invitation/send", null, Cancel);

        var titles = (await amara.GetFromJsonAsync<JsonElement>("/api/notifications", Cancel)).GetProperty("items").EnumerateArray().Select(i => i.GetProperty("title").GetString()).ToList();
        Assert.Contains("Kemi added Balloon arch ($40) to the budget", titles);
        Assert.Contains("Kemi sent the invitations", titles);
        Assert.Empty((await kemi.GetFromJsonAsync<JsonElement>("/api/notifications", Cancel)).GetProperty("items").EnumerateArray());
        Assert.Empty((await dev.GetFromJsonAsync<JsonElement>("/api/notifications", Cancel)).GetProperty("items").EnumerateArray());
    }

    [Fact]
    public async Task Planners_hear_when_a_guest_replies()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await amara.PostAsync($"/api/parties/{party.Id}/invitation/send", null, Cancel);
        var token = Regex.Match(factory.Email.Sent.Single(e => e.To == "lily.chen@example.com").Body, "/rsvp/([A-Za-z0-9_-]+)").Groups[1].Value;
        using var guest = factory.CreateClient();

        await guest.PutAsJsonAsync($"/api/rsvp/{token}", new { coming = true, allergies = "Dairy-free", parentName = "Lily Chen", mobile = "416-555-0177", parentStaying = (bool?)null, siblings = (int?)null, note = (string?)null }, Cancel);

        using var kemi = factory.CreateClientFor(TestParent.Kemi);
        var titles = (await kemi.GetFromJsonAsync<JsonElement>("/api/notifications", Cancel)).GetProperty("items").EnumerateArray().Select(i => i.GetProperty("title").GetString());
        Assert.Contains("Lily Chen replied: Maya is coming!", titles);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
