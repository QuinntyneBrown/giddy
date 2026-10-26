using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-038, L2-039 and L2-041: add and remove guests.</summary>
public sealed class ManageGuestsTests : IAsyncLifetime
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
    public async Task A_guest_added_before_invitations_go_out_is_not_sent_yet()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(GuestsUrl, Guest(), Cancel);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var guest = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal(("Samira Haddad", "Rania Haddad", "notSent"), (guest.GetProperty("childName").GetString(), guest.GetProperty("parentName").GetString(), guest.GetProperty("rsvp").GetString()));
        Assert.Equal(6, (await ListAsync(amara)).GetProperty("guests").GetArrayLength());
        Assert.Empty(factory.Email.Sent);
    }

    [Fact]
    public async Task Send_now_invites_the_new_guest_when_invitations_have_gone_out()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.PostAsync($"/api/parties/{dinoParty.Id}/invitation/send", null, Cancel)).EnsureSuccessStatusCode();
        factory.Email.Sent.Clear();

        var response = await amara.PostAsJsonAsync(GuestsUrl, Guest(sendNow: true), Cancel);

        var guest = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("waiting", guest.GetProperty("rsvp").GetString());
        Assert.Equal("rania.haddad@example.com", Assert.Single(factory.Email.Sent).To);
        Assert.Contains("/rsvp/", factory.Email.Sent.Single().Body);
    }

    [Theory]
    [InlineData("not-an-email", "416-555-0131", "email")]
    [InlineData("rania.haddad@example.com", "212-555-0131", "mobile")]
    [InlineData("rania.haddad@example.com", "416-555", "mobile")]
    public async Task An_invalid_email_or_non_canadian_mobile_is_rejected(string email, string mobile, string field)
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(GuestsUrl, Guest(email: email, mobile: mobile), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.True(problem.GetProperty("errors").TryGetProperty(field, out _));
        Assert.Equal(5, (await ListAsync(amara)).GetProperty("guests").GetArrayLength());
    }

    [Fact]
    public async Task The_same_child_and_parent_email_cannot_be_added_twice()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(GuestsUrl, Guest(child: "maya chen", email: "Lily.Chen@example.com"), Cancel);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Maya Chen is already on the list.", problem.GetProperty("title").GetString());
    }

    [Fact]
    public async Task The_list_holds_up_to_sixty_guests()
    {
        await factory.SeedAsync(db => db.Guests.AddRange(Enumerable.Range(1, 55).Select(i =>
            new Guest(Guid.NewGuid(), dinoParty.Id, $"Child {i}", $"Parent {i}", $"parent{i}@example.com", null))));
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(GuestsUrl, Guest(), Cancel);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("The guest list holds up to 60 guests.", problem.GetProperty("title").GetString());
    }

    [Fact]
    public async Task Viewers_cannot_add_guests()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);

        var response = await dev.PostAsJsonAsync(GuestsUrl, Guest(), Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task A_removed_guest_can_be_restored_with_their_reply_for_ten_minutes()
    {
        await factory.SeedAsync(db =>
        {
            var maya = db.Guests.Find(guests[0].Id)!;
            maya.Invite("hash-maya", "unused", Instant.FromUtc(2026, 10, 20, 12, 0));
            maya.Reply(true, "Dairy-free", true, null, "Lily Chen", null, null, Instant.FromUtc(2026, 10, 21, 12, 0));
        });
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var removed = await amara.DeleteAsync($"{GuestsUrl}/{guests[0].Id}", Cancel);
        var afterRemove = await ListAsync(amara);
        var restored = await amara.PostAsync($"{GuestsUrl}/{guests[0].Id}/restore", null, Cancel);

        Assert.Equal(HttpStatusCode.NoContent, removed.StatusCode);
        Assert.Equal(4, afterRemove.GetProperty("guests").GetArrayLength());
        Assert.Equal(0, afterRemove.GetProperty("counts").GetProperty("coming").GetInt32());
        Assert.Equal(0, afterRemove.GetProperty("allergyList").GetArrayLength());
        Assert.Equal(HttpStatusCode.OK, restored.StatusCode);
        var guest = await restored.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal(("coming", "Dairy-free"), (guest.GetProperty("rsvp").GetString(), guest.GetProperty("allergies").GetString()));
        Assert.Equal(1, (await ListAsync(amara)).GetProperty("counts").GetProperty("coming").GetInt32());
    }

    [Fact]
    public async Task Undo_is_refused_after_ten_minutes()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await amara.DeleteAsync($"{GuestsUrl}/{guests[0].Id}", Cancel);
        factory.Clock.Advance(Duration.FromMinutes(11));

        var restored = await amara.PostAsync($"{GuestsUrl}/{guests[0].Id}/restore", null, Cancel);

        Assert.Equal(HttpStatusCode.Conflict, restored.StatusCode);
        Assert.Equal(4, (await ListAsync(amara)).GetProperty("guests").GetArrayLength());
    }

    [Fact]
    public async Task A_removed_familys_private_link_stops_working()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.PostAsync($"/api/parties/{dinoParty.Id}/invitation/send", null, Cancel)).EnsureSuccessStatusCode();
        var token = System.Text.RegularExpressions.Regex.Match(factory.Email.Sent.Single(e => e.To == "lily.chen@example.com").Body, "/rsvp/([A-Za-z0-9_-]+)").Groups[1].Value;

        await amara.DeleteAsync($"{GuestsUrl}/{guests[0].Id}", Cancel);
        using var guest = factory.CreateClient();
        var response = await guest.GetAsync($"/api/rsvp/{token}", Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Only_planners_remove_guests_and_only_from_their_own_party()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var viewer = await dev.DeleteAsync($"{GuestsUrl}/{guests[0].Id}", Cancel);
        var unknown = await amara.DeleteAsync($"{GuestsUrl}/{Guid.NewGuid()}", Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, viewer.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, unknown.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private string GuestsUrl => $"/api/parties/{dinoParty.Id}/guests";

    private async Task<JsonElement> ListAsync(HttpClient client) => await client.GetFromJsonAsync<JsonElement>(GuestsUrl, Cancel);

    private static object Guest(string child = "Samira Haddad", string email = "rania.haddad@example.com", string? mobile = "416-555-0131", bool sendNow = false) => new
    {
        childName = child,
        parentName = "Rania Haddad",
        email,
        mobile,
        sendNow,
    };
}
