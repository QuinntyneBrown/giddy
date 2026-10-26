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

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private string Url => $"/api/parties/{dinoParty.Id}/invitation";

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
