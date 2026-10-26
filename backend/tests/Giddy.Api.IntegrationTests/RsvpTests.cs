using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-044: guest parents reply through their private link, without an account.</summary>
public sealed class RsvpTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan();
    private Dictionary<string, string> tokens = [];
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.Add(dinoParty);
            db.Guests.AddRange(TestData.GuestsFor(dinoParty));
            db.CatalogueItems.AddRange(DemoCatalogue.Items());
        });
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.PostAsync($"/api/parties/{dinoParty.Id}/invitation/send", null, Cancel)).EnsureSuccessStatusCode();
        tokens = factory.Email.Sent.ToDictionary(e => e.To, e => Regex.Match(e.Body, "/rsvp/([A-Za-z0-9_-]+)").Groups[1].Value);
    }

    [Fact]
    public async Task The_private_link_shows_the_invitation_and_only_this_familys_reply()
    {
        using var guest = factory.CreateClient();

        var response = await guest.GetAsync(RsvpUrl("lily.chen@example.com"), Cancel);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var raw = await response.Content.ReadAsStringAsync(Cancel);
        var rsvp = JsonDocument.Parse(raw).RootElement;
        Assert.Equal("Zuri is turning 7!", rsvp.GetProperty("invitation").GetProperty("headline").GetString());
        Assert.Equal("Dino Den Play Café, 1124 Queen St E", rsvp.GetProperty("invitation").GetProperty("details").GetProperty("place").GetString());
        var reply = rsvp.GetProperty("guest");
        Assert.Equal(("Maya", "the Chen family", "Lily Chen", "waiting"), (reply.GetProperty("childFirstName").GetString(), reply.GetProperty("familyName").GetString(), reply.GetProperty("parentName").GetString(), reply.GetProperty("rsvp").GetString()));
        Assert.Equal("416-555-0177", reply.GetProperty("mobile").GetString());
        Assert.True(rsvp.GetProperty("canChange").GetBoolean());
        Assert.DoesNotContain("Arjun", raw);
        Assert.DoesNotContain("priya", raw, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task A_reply_updates_the_hosts_list_counts_and_allergies()
    {
        using var guest = factory.CreateClient();

        var response = await guest.PutAsJsonAsync(RsvpUrl("lily.chen@example.com"), Reply(allergies: "Dairy-free"), Cancel);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var reply = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal(("coming", "Dairy-free"), (reply.GetProperty("guest").GetProperty("rsvp").GetString(), reply.GetProperty("guest").GetProperty("allergies").GetString()));
        using var amara = factory.CreateClientFor(TestParent.Amara);
        var list = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/guests", Cancel);
        Assert.Equal(1, list.GetProperty("counts").GetProperty("coming").GetInt32());
        Assert.Contains(list.GetProperty("allergyList").EnumerateArray(), a => a.GetProperty("child").GetString() == "Maya");
        var party = await factory.QueryAsync(db => db.Parties.SingleAsync(p => p.Id == dinoParty.Id, Cancel));
        Assert.Contains("dairy-free", party.Allergies);
    }

    [Theory]
    [InlineData("", "416-555-0177", "parentName")]
    [InlineData("Lily Chen", "555-01", "mobile")]
    public async Task A_missing_name_or_invalid_mobile_is_rejected(string name, string mobile, string field)
    {
        using var guest = factory.CreateClient();

        var response = await guest.PutAsJsonAsync(RsvpUrl("lily.chen@example.com"), Reply(name: name, mobile: mobile), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.True(problem.GetProperty("errors").TryGetProperty(field, out _));
    }

    [Fact]
    public async Task A_changed_reply_replaces_the_earlier_one_until_the_rsvp_by_date()
    {
        using var guest = factory.CreateClient();
        (await guest.PutAsJsonAsync(RsvpUrl("lily.chen@example.com"), Reply(), Cancel)).EnsureSuccessStatusCode();

        var changed = await guest.PutAsJsonAsync(RsvpUrl("lily.chen@example.com"), Reply(coming: false), Cancel);
        factory.Clock.Advance(Duration.FromDays(13));
        var tooLate = await guest.PutAsJsonAsync(RsvpUrl("lily.chen@example.com"), Reply(), Cancel);

        Assert.Equal(HttpStatusCode.OK, changed.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, tooLate.StatusCode);
        var maya = await factory.QueryAsync(db => db.Guests.SingleAsync(g => g.ChildName == "Maya Chen", Cancel));
        Assert.Equal(RsvpStatus.CantCome, maya.Rsvp);
    }

    [Fact]
    public async Task A_link_that_does_not_work_shows_no_party_details()
    {
        using var guest = factory.CreateClient();

        var response = await guest.GetAsync("/api/rsvp/not-a-real-token-at-all00", Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var raw = await response.Content.ReadAsStringAsync(Cancel);
        Assert.Contains("no longer works", raw);
        Assert.DoesNotContain("Zuri", raw);
    }

    [Fact]
    public async Task A_link_for_a_deleted_party_no_longer_works()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.DeleteAsync($"/api/parties/{dinoParty.Id}", Cancel)).EnsureSuccessStatusCode();
        using var guest = factory.CreateClient();

        var response = await guest.GetAsync(RsvpUrl("lily.chen@example.com"), Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task The_calendar_file_has_the_party_in_toronto_time()
    {
        using var guest = factory.CreateClient();

        var response = await guest.GetAsync($"{RsvpUrl("lily.chen@example.com")}/calendar.ics", Cancel);

        Assert.Equal("text/calendar", response.Content.Headers.ContentType?.MediaType);
        var calendar = await response.Content.ReadAsStringAsync(Cancel);
        Assert.Contains("DTSTART;TZID=America/Toronto:20261114T130000", calendar);
        Assert.Contains("DTEND;TZID=America/Toronto:20261114T153000", calendar);
        Assert.Contains("SUMMARY:Zuri’s birthday party", calendar);
        Assert.Contains("LOCATION:Dino Den Play Café\\, 1124 Queen St E", calendar);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private string RsvpUrl(string email) => $"/api/rsvp/{tokens[email]}";

    private static object Reply(bool coming = true, string? allergies = null, string name = "Lily Chen", string mobile = "416-555-0177") => new
    {
        coming,
        allergies,
        parentStaying = true,
        parentName = name,
        mobile,
        note = "Maya can't wait!",
    };
}
