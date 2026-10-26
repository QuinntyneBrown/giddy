using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-046: share the allergy list with the venue, and hear when it needs an update.</summary>
public sealed class AllergyListTests : IAsyncLifetime
{
    private static readonly Instant Earlier = Instant.FromUtc(2026, 10, 22, 12, 0);
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan(confirmedBookings: 1);
    private readonly Party unbooked = TestData.DinoParty(new LocalDate(2026, 11, 21)).WithPlan();
    private IReadOnlyList<Guest> guests = [];
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        guests = TestData.GuestsFor(dinoParty);
        foreach (var guest in guests)
        {
            guest.Invite($"hash-{guest.ChildFirstName}", "unused", Earlier);
        }

        guests[0].Reply(true, "Dairy-free", true, null, "Lily Chen", null, null, Earlier);
        guests[1].Reply(true, "Peanut", true, null, "Priya Patel", null, null, Earlier);
        guests[4].Reply(false, "Gluten", null, null, "Jordan Wilson", null, null, Earlier);
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.AddRange(dinoParty, unbooked);
            db.Guests.AddRange(guests);
        });
    }

    [Fact]
    public async Task The_venue_gets_first_names_and_allergies_only_and_the_task_is_ticked()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsync(ShareUrl(dinoParty), null, Cancel);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal(("Dino Den Play Café", 2), (result.GetProperty("venue").GetString(), result.GetProperty("children").GetInt32()));
        var (venue, entries) = Assert.Single(factory.Partner.AllergyLists);
        Assert.Equal("Dino Den Play Café", venue);
        Assert.Equal([("Arjun", "Peanut"), ("Maya", "Dairy-free")], entries.Select(e => (e.Child, e.Allergy)));
        var party = await factory.QueryAsync(db => db.Parties.SingleAsync(p => p.Id == dinoParty.Id, Cancel));
        Assert.True(party.Checklist.Single(t => t.Title == Party.AllergyListTask).Done);
    }

    [Fact]
    public async Task There_is_nothing_to_share_with_until_a_venue_is_booked()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsync(ShareUrl(unbooked), null, Cancel);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Empty(factory.Partner.AllergyLists);
    }

    [Fact]
    public async Task A_new_allergy_after_sharing_nudges_the_parent_to_send_an_update()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.PostAsync(ShareUrl(dinoParty), null, Cancel)).EnsureSuccessStatusCode();
        var token = "leo-token-0000000000000";
        await factory.SeedAsync(db => db.Guests.Find(guests[2].Id)!.Invite(Giddy.Application.Invitations.RsvpTokens.Hash(token), "unused", Earlier));
        await factory.SeedAsync(db => db.Invitations.Add(new Giddy.Domain.Invitations.Invitation(dinoParty.Id, "dino-green", "Zuri is turning 7!", "Come dig!", new LocalDate(2026, 11, 6))));
        using var guest = factory.CreateClient();

        (await guest.PutAsJsonAsync($"/api/rsvp/{token}", new { coming = true, allergies = "Sesame", parentName = "Marco Rossi" }, Cancel)).EnsureSuccessStatusCode();

        var nudges = (await amara.GetFromJsonAsync<JsonElement>("/api/home/nudges", Cancel)).EnumerateArray().ToList();
        var update = nudges[0];
        Assert.Equal("Send the allergy update to Dino Den Play Café", update.GetProperty("title").GetString());
        Assert.Equal("Leo has a new allergy since you shared the list.", update.GetProperty("context").GetString());
        (await amara.PostAsync(ShareUrl(dinoParty), null, Cancel)).EnsureSuccessStatusCode();
        var after = (await amara.GetFromJsonAsync<JsonElement>("/api/home/nudges", Cancel)).EnumerateArray();
        Assert.DoesNotContain(after, n => n.GetProperty("title").GetString()!.StartsWith("Send the allergy update"));
    }

    [Fact]
    public async Task Viewers_cannot_share_the_list()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);

        var response = await dev.PostAsync(ShareUrl(dinoParty), null, Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private static string ShareUrl(Party party) => $"/api/parties/{party.Id}/allergy-list/share";
}
