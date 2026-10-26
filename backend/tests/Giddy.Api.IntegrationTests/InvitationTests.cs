using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-043: design and send invitations.</summary>
public sealed class InvitationTests : IAsyncLifetime
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
    }

    [Fact]
    public async Task Giddy_drafts_the_invitation_from_the_party()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var invitation = await amara.GetFromJsonAsync<JsonElement>(Url, Cancel);

        Assert.Equal("dino-green", invitation.GetProperty("design").GetString());
        Assert.Equal("Zuri is turning 7!", invitation.GetProperty("headline").GetString());
        Assert.Contains("Dino Dig", invitation.GetProperty("message").GetString());
        Assert.Equal("2026-11-06", invitation.GetProperty("rsvpBy").GetString());
        Assert.True(invitation.GetProperty("askAllergies").GetBoolean());
        Assert.True(invitation.GetProperty("askParentStaying").GetBoolean());
        Assert.False(invitation.GetProperty("askSiblings").GetBoolean());
        Assert.True(invitation.GetProperty("byEmail").GetBoolean());
        Assert.True(invitation.GetProperty("byText").GetBoolean());
        Assert.Equal((4, 4, 5), (invitation.GetProperty("emailReach").GetInt32(), invitation.GetProperty("textReach").GetInt32(), invitation.GetProperty("notSent").GetInt32()));
        var details = invitation.GetProperty("details");
        Assert.Equal(("2026-11-14", "13:00", "15:30"), (details.GetProperty("date").GetString(), details.GetProperty("startsAt").GetString(), details.GetProperty("endsAt").GetString()));
        Assert.Equal("Dino Den Play Café, 1124 Queen St E", details.GetProperty("place").GetString());
        Assert.Equal(JsonValueKind.Null, invitation.GetProperty("sentAt").ValueKind);
    }

    [Fact]
    public async Task Planners_save_their_changes()
    {
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);

        var saved = await kemi.PutAsJsonAsync(Url, Edit(headline: "Dig in with Zuri!"), Cancel);
        var invitation = await kemi.GetFromJsonAsync<JsonElement>(Url, Cancel);

        Assert.Equal(HttpStatusCode.OK, saved.StatusCode);
        Assert.Equal("Dig in with Zuri!", invitation.GetProperty("headline").GetString());
        Assert.Equal("volcano", invitation.GetProperty("design").GetString());
        Assert.True(invitation.GetProperty("askSiblings").GetBoolean());
        Assert.False(invitation.GetProperty("byText").GetBoolean());
    }

    [Theory]
    [InlineData("headline", 61, 10, "2026-11-06")]
    [InlineData("message", 10, 281, "2026-11-06")]
    [InlineData("rsvpBy", 10, 10, "2026-11-14")]
    public async Task Invalid_details_are_rejected(string field, int headlineLength, int messageLength, string rsvpBy)
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PutAsJsonAsync(Url, Edit(new string('a', headlineLength), new string('b', messageLength), rsvpBy), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.True(problem.GetProperty("errors").TryGetProperty(field, out _));
    }

    [Fact]
    public async Task Viewers_cannot_change_the_invitation()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);

        var response = await dev.PutAsJsonAsync(Url, Edit(), Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task A_test_goes_only_to_the_parent()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsync($"{Url}/test", null, Cancel);

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        var email = Assert.Single(factory.Email.Sent);
        Assert.Equal(TestParent.Amara.Email, email.To);
        Assert.Contains("Zuri is turning 7!", email.Subject + email.Body);
        Assert.Empty(factory.Sms.Sent);
        Assert.Equal("notSent", (await GuestAsync(amara, "Maya Chen")).GetProperty("rsvp").GetString());
    }

    [Fact]
    public async Task Sending_gives_every_family_not_yet_invited_a_private_link_by_each_channel_they_can_get()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsync($"{Url}/send", null, Cancel);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal(5, result.GetProperty("sent").GetInt32());
        Assert.Equal("2026-11-03", result.GetProperty("automaticReminderOn").GetString());
        Assert.Equal(
            ["hodan.mohamed@example.com", "lily.chen@example.com", "marco.rossi@example.com", "priya.patel@example.com"],
            factory.Email.Sent.Select(e => e.To).Order());
        Assert.Equal(["416-555-0123", "416-555-0177", "416-555-0199", "647-555-0101"], factory.Sms.Sent.Select(m => m.To).Order());
        Assert.All(factory.Email.Sent, e => Assert.Matches("/rsvp/[A-Za-z0-9_-]{22}", e.Body));
        Assert.Equal(5, factory.Email.Sent.Select(e => e.Body).Concat(factory.Sms.Sent.Select(m => m.Body))
            .Select(b => System.Text.RegularExpressions.Regex.Match(b, "/rsvp/([A-Za-z0-9_-]+)").Groups[1].Value).Distinct().Count());
        Assert.All((await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/guests", Cancel)).GetProperty("guests").EnumerateArray(),
            g => Assert.Equal("waiting", g.GetProperty("rsvp").GetString()));
        Assert.NotEqual(JsonValueKind.Null, (await amara.GetFromJsonAsync<JsonElement>(Url, Cancel)).GetProperty("sentAt").ValueKind);
    }

    [Fact]
    public async Task Sending_again_only_reaches_families_added_since()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.PostAsync($"{Url}/send", null, Cancel)).EnsureSuccessStatusCode();
        await factory.SeedAsync(db => db.Guests.Add(new Guest(Guid.NewGuid(), dinoParty.Id, "Zara Ali", "Fatima Ali", "fatima.ali@example.com", null)));
        factory.Email.Sent.Clear();

        var result = await (await amara.PostAsync($"{Url}/send", null, Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);

        Assert.Equal(1, result.GetProperty("sent").GetInt32());
        Assert.Equal("fatima.ali@example.com", Assert.Single(factory.Email.Sent).To);
    }

    [Fact]
    public async Task Text_is_skipped_when_it_is_not_chosen()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.PutAsJsonAsync(Url, Edit(), Cancel)).EnsureSuccessStatusCode();

        (await amara.PostAsync($"{Url}/send", null, Cancel)).EnsureSuccessStatusCode();

        Assert.Empty(factory.Sms.Sent);
        Assert.Equal(4, factory.Email.Sent.Count);
    }

    [Fact]
    public async Task An_unverified_email_blocks_sending()
    {
        using var unverified = await factory.CreateBrowserClientFor(TestParent.Amara with { EmailVerified = false });

        var response = await unverified.PostAsync($"{Url}/send", null, Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("email-unverified", problem.GetProperty("code").GetString());
        Assert.Empty(factory.Email.Sent);
    }

    [Fact]
    public async Task Viewers_cannot_send()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);

        var response = await dev.PostAsync($"{Url}/send", null, Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Empty(factory.Email.Sent);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private string Url => $"/api/parties/{dinoParty.Id}/invitation";

    private async Task<JsonElement> GuestAsync(HttpClient client, string child) =>
        (await client.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/guests", Cancel))
            .GetProperty("guests").EnumerateArray().Single(g => g.GetProperty("childName").GetString() == child);

    private static object Edit(string headline = "Zuri is turning 7!", string message = "Come dig for fossils!", string rsvpBy = "2026-11-06") => new
    {
        design = "volcano",
        headline,
        message,
        rsvpBy,
        askAllergies = true,
        askParentStaying = true,
        askSiblings = true,
        byEmail = true,
        byText = false,
    };
}
