using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-009: co-planners, view-only planners and the view-only link.</summary>
public sealed partial class SharingTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party party = TestData.DinoParty().WithPlan(confirmedBookings: 1);
    private readonly Party alone = Party.Plan(Guid.NewGuid(), "Kofi’s Choo-Choo 4th", new NodaTime.LocalDate(2027, 2, 6), new NodaTime.LocalTime(10, 0), new NodaTime.LocalTime(12, 0), TestParent.Amara.Id);
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.AddRange(party, alone);
        db.Guests.AddRange(TestData.GuestsFor(party));
    });

    [Fact]
    public async Task An_invited_planner_joins_with_the_role_they_were_given()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);

        var invited = await amara.PostAsJsonAsync(MembersUrl(alone), new { email = TestParent.Dev.Email, role = "coPlanner" }, Cancel);
        var email = Assert.Single(factory.Email.Sent);
        var joined = await dev.PostAsJsonAsync("/api/parties/join", new { token = JoinLink().Match(email.Body).Groups[1].Value }, Cancel);

        Assert.Equal(HttpStatusCode.Created, invited.StatusCode);
        Assert.Equal((TestParent.Dev.Email, "Amara Okafor invited you to plan Kofi’s Choo-Choo 4th"), (email.To, email.Subject));
        Assert.Equal(HttpStatusCode.OK, joined.StatusCode);
        Assert.Equal(alone.Id, (await joined.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("partyId").GetGuid());
        var renamed = await dev.PutAsJsonAsync($"/api/parties/{alone.Id}", new { name = "Kofi’s Train Party" }, Cancel);
        Assert.Equal(HttpStatusCode.OK, renamed.StatusCode);
        var deleted = await dev.DeleteAsync($"/api/parties/{alone.Id}", Cancel);
        Assert.Equal(HttpStatusCode.Forbidden, deleted.StatusCode);
    }

    [Fact]
    public async Task The_members_list_shows_planners_and_pending_invitations()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await amara.PostAsJsonAsync(MembersUrl(party), new { email = "grandma@example.com", role = "viewer" }, Cancel);

        var members = await amara.GetFromJsonAsync<JsonElement>(MembersUrl(party), Cancel);

        var list = members.GetProperty("members").EnumerateArray().Select(m => (m.GetProperty("name").GetString(), m.GetProperty("role").GetString())).ToList();
        Assert.Equal([("Amara Okafor", "owner"), ("Kemi Okafor", "coPlanner"), ("Dev Patel", "viewer")], list);
        var pending = Assert.Single(members.GetProperty("invited").EnumerateArray());
        Assert.Equal(("grandma@example.com", "viewer"), (pending.GetProperty("email").GetString(), pending.GetProperty("role").GetString()));
    }

    [Fact]
    public async Task An_invalid_email_sends_nothing()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(MembersUrl(party), new { email = "grandma", role = "viewer" }, Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("Enter an email address like name@example.com", (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("errors").GetProperty("email")[0].GetString());
        Assert.Empty(factory.Email.Sent);
    }

    [Fact]
    public async Task Viewers_cannot_invite_and_nobody_can_remove_the_owner()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);

        var byViewer = await dev.PostAsJsonAsync(MembersUrl(party), new { email = "grandma@example.com", role = "viewer" }, Cancel);
        var removeOwner = await kemi.DeleteAsync($"{MembersUrl(party)}/{TestParent.Amara.Id}", Cancel);

        Assert.Equal((HttpStatusCode.Forbidden, HttpStatusCode.Forbidden), (byViewer.StatusCode, removeOwner.StatusCode));
    }

    [Fact]
    public async Task A_removed_planner_can_no_longer_open_the_party()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        using var kemi = factory.CreateClientFor(TestParent.Kemi);

        var removed = await amara.DeleteAsync($"{MembersUrl(party)}/{TestParent.Kemi.Id}", Cancel);
        var opened = await kemi.GetAsync($"/api/parties/{party.Id}/overview", Cancel);

        Assert.Equal(HttpStatusCode.NoContent, removed.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, opened.StatusCode);
    }

    [Fact]
    public async Task The_view_only_link_shows_a_summary_to_anyone_without_contacts_or_allergies()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var link = await (await amara.PostAsync($"/api/parties/{party.Id}/share-link", null, Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);
        using var visitor = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var summary = await visitor.GetAsync($"/api/shared/{link.GetProperty("token").GetString()}", Cancel);
        var body = await summary.Content.ReadAsStringAsync(Cancel);

        Assert.Equal(HttpStatusCode.OK, summary.StatusCode);
        Assert.StartsWith("/shared/", link.GetProperty("url").GetString());
        Assert.Contains("Zuri’s Dino Dig 7th", body);
        Assert.Contains("Dino Den Play Café", body);
        Assert.DoesNotContain("@example.com", body);
        Assert.DoesNotContain("416-555", body);
        Assert.DoesNotContain("peanut", body, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(HttpStatusCode.NotFound, (await visitor.GetAsync("/api/shared/not-a-real-token", Cancel)).StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private static string MembersUrl(Party party) => $"/api/parties/{party.Id}/members";

    [GeneratedRegex(@"/join/([A-Za-z0-9_-]+)")]
    private static partial Regex JoinLink();
}
