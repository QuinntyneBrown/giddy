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

/// <summary>L2-042: reminders to selected guests, with a 48-hour cooldown.</summary>
public sealed class RemindersTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan();
    private IReadOnlyList<Guest> guests = [];
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        guests = TestData.GuestsFor(dinoParty);
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.Add(dinoParty);
            db.Guests.AddRange(guests);
            db.CatalogueItems.AddRange(DemoCatalogue.Items());
        });
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.PostAsync($"/api/parties/{dinoParty.Id}/invitation/send", null, Cancel)).EnsureSuccessStatusCode();
        factory.Email.Sent.Clear();
        factory.Sms.Sent.Clear();
    }

    [Fact]
    public async Task Reminders_go_to_each_selected_family_by_every_way_they_can_be_reached()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var result = await RemindAsync(amara, "Maya Chen", "Aisha Mohamed", "Ava Wilson");

        Assert.Equal(["Aisha", "Ava", "Maya"], result.GetProperty("reminded").EnumerateArray().Select(n => n.GetString()).Order());
        Assert.Equal(0, result.GetProperty("skipped").GetArrayLength());
        Assert.Equal(["hodan.mohamed@example.com", "lily.chen@example.com"], factory.Email.Sent.Select(e => e.To).Order());
        Assert.Equal(["416-555-0177", "416-555-0199"], factory.Sms.Sent.Select(m => m.To).Order());
        Assert.All(factory.Email.Sent, e => Assert.Contains("/rsvp/", e.Body));
    }

    [Fact]
    public async Task A_family_reminded_in_the_last_48_hours_is_skipped_and_the_parent_is_told_why()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await RemindAsync(amara, "Maya Chen");
        factory.Email.Sent.Clear();

        var again = await RemindAsync(amara, "Maya Chen", "Leo Rossi");
        factory.Clock.Advance(Duration.FromHours(49));
        var later = await RemindAsync(amara, "Maya Chen");

        var skipped = Assert.Single(again.GetProperty("skipped").EnumerateArray());
        Assert.Equal(("Maya", "Reminded less than 48 hours ago"), (skipped.GetProperty("child").GetString(), skipped.GetProperty("reason").GetString()));
        Assert.Equal(["Leo"], again.GetProperty("reminded").EnumerateArray().Select(n => n.GetString()));
        Assert.Equal(["Maya"], later.GetProperty("reminded").EnumerateArray().Select(n => n.GetString()));
    }

    [Fact]
    public async Task Families_who_cannot_be_reached_are_named()
    {
        await factory.SeedAsync(db =>
        {
            var zara = new Guest(Guid.NewGuid(), dinoParty.Id, "Zara Ali", "Fatima Ali", null, null);
            zara.Invite("hash-zara", "unused", Instant.FromUtc(2026, 10, 25, 12, 0));
            db.Guests.Add(zara);
            var aisha = db.Guests.Local.FirstOrDefault(g => g.Id == guests[3].Id) ?? db.Guests.Find(guests[3].Id)!;
            aisha.Bounce();
        });
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var result = await RemindAsync(amara, "Aisha Mohamed", "Zara Ali");

        var undeliverable = result.GetProperty("undeliverable").EnumerateArray().ToDictionary(u => u.GetProperty("child").GetString()!, u => u.GetProperty("reason").GetString());
        Assert.Equal("The email bounced and there’s no mobile number", undeliverable["Aisha"]);
        Assert.Equal("No email or mobile number", undeliverable["Zara"]);
        Assert.Empty(factory.Email.Sent);
    }

    [Fact]
    public async Task Families_who_already_replied_are_skipped()
    {
        await factory.SeedAsync(db => db.Guests.Find(guests[0].Id)!.Reply(true, null, null, null, "Lily Chen", null, null, Instant.FromUtc(2026, 10, 25, 12, 0)));
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var result = await RemindAsync(amara, "Maya Chen");

        Assert.Equal("Already replied", Assert.Single(result.GetProperty("skipped").EnumerateArray()).GetProperty("reason").GetString());
    }

    [Fact]
    public async Task Viewers_cannot_send_reminders_and_other_parties_guests_are_not_found()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var viewer = await dev.PostAsJsonAsync(Url, new { guestIds = new[] { guests[0].Id } }, Cancel);
        var unknown = await amara.PostAsJsonAsync(Url, new { guestIds = new[] { Guid.NewGuid() } }, Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, viewer.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, unknown.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private string Url => $"/api/parties/{dinoParty.Id}/reminders";

    private async Task<JsonElement> RemindAsync(HttpClient client, params string[] children)
    {
        var ids = guests.Where(g => children.Contains(g.ChildName)).Select(g => g.Id).ToList();
        if (children.Contains("Zara Ali"))
        {
            ids.Add(await factory.QueryAsync(db => Task.FromResult(db.Guests.Single(g => g.ChildName == "Zara Ali").Id)));
        }

        var response = await client.PostAsJsonAsync(Url, new { guestIds = ids }, Cancel);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
    }
}
