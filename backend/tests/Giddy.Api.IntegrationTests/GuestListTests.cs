using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>The guest list the invitations, RSVPs and reminders work from (L2-042 to L2-046).</summary>
public sealed class GuestListTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan();
    private IReadOnlyList<Guest> guests = [];
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        guests = TestData.GuestsFor(dinoParty);
        guests[0].Invite("hash-maya", "protected", NodaTime.Instant.FromUtc(2026, 10, 20, 12, 0));
        guests[0].Reply(true, "Dairy-free", true, null, "Lily Chen", null, null, NodaTime.Instant.FromUtc(2026, 10, 21, 12, 0));
        guests[1].Invite("hash-arjun", "protected", NodaTime.Instant.FromUtc(2026, 10, 20, 12, 0));
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.Add(dinoParty);
            db.Guests.AddRange(guests);
        });
    }

    [Fact]
    public async Task Planners_see_every_guest_with_replies_counts_and_the_allergy_list()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var list = await amara.GetFromJsonAsync<JsonElement>(Url, Cancel);

        var rows = list.GetProperty("guests").EnumerateArray().ToList();
        Assert.Equal(["Aisha Mohamed", "Arjun Patel", "Ava Wilson", "Leo Rossi", "Maya Chen"], rows.Select(r => r.GetProperty("childName").GetString()));
        var maya = rows.Single(r => r.GetProperty("childName").GetString() == "Maya Chen");
        Assert.Equal(("coming", "Dairy-free", "Lily Chen"), (maya.GetProperty("rsvp").GetString(), maya.GetProperty("allergies").GetString(), maya.GetProperty("parentName").GetString()));
        Assert.Equal("lily.chen@example.com", maya.GetProperty("email").GetString());
        Assert.Equal("waiting", rows.Single(r => r.GetProperty("childName").GetString() == "Arjun Patel").GetProperty("rsvp").GetString());
        var counts = list.GetProperty("counts");
        Assert.Equal((5, 1, 1, 0, 3), (counts.GetProperty("invited").GetInt32(), counts.GetProperty("coming").GetInt32(), counts.GetProperty("waiting").GetInt32(), counts.GetProperty("cantCome").GetInt32(), counts.GetProperty("notSent").GetInt32()));
        var allergy = Assert.Single(list.GetProperty("allergyList").EnumerateArray());
        Assert.Equal(("Maya", "Dairy-free"), (allergy.GetProperty("child").GetString(), allergy.GetProperty("allergy").GetString()));
    }

    [Fact]
    public async Task Viewers_see_the_list_without_parents_contact_details()
    {
        using var dev = factory.CreateClientFor(TestParent.Dev);

        var list = await dev.GetFromJsonAsync<JsonElement>(Url, Cancel);

        Assert.All(list.GetProperty("guests").EnumerateArray(), g =>
        {
            Assert.Equal(JsonValueKind.Null, g.GetProperty("email").ValueKind);
            Assert.Equal(JsonValueKind.Null, g.GetProperty("mobile").ValueKind);
        });
    }

    [Fact]
    public async Task Strangers_cannot_see_the_guest_list()
    {
        using var stranger = factory.CreateClientFor(TestParent.Stranger);

        var response = await stranger.GetAsync(Url, Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private string Url => $"/api/parties/{dinoParty.Id}/guests";
}
