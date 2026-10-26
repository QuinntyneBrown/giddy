using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-067: downloading and deleting a parent's data.</summary>
public sealed partial class PrivacyTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private Party party = null!;
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        var amara = Accounts.Amara(db);
        foreach (var other in new[] { TestParent.Kemi, TestParent.Dev })
        {
            db.Parents.Add(new Giddy.Domain.Parents.Parent(other.Id, other.Name, other.Email));
        }

        db.Families.Find(amara.Id)?.AddChild(new Giddy.Domain.Families.Child(TestData.Zuri, "Zuri", new LocalDate(2019, 11, 14)));
        party = TestData.DinoParty().WithPlan(confirmedBookings: 1);
        db.Parties.Add(party);
        db.Guests.AddRange(TestData.GuestsFor(party));
    });

    [Fact]
    public async Task Download_emails_a_link_to_an_archive_only_the_parent_can_open()
    {
        using var browser = await SignedInAsync();

        var asked = await browser.Http.PostAsync("/api/privacy/export", null, Cancel);
        var email = factory.Email.Sent.Single(m => m.Subject == "Your Giddy data is ready");
        var path = Link().Match(email.Body).Value;
        var archive = await browser.Http.GetAsync(path, Cancel);
        using var kemi = factory.CreateClientFor(TestParent.Kemi);
        var other = await kemi.GetAsync(path, Cancel);

        Assert.Equal(HttpStatusCode.Accepted, asked.StatusCode);
        Assert.Contains("7 days", email.Body);
        Assert.Equal(HttpStatusCode.OK, archive.StatusCode);
        var data = await archive.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Zuri", data.GetProperty("children")[0].GetProperty("firstName").GetString());
        Assert.Equal("Zuri’s Dino Dig 7th", data.GetProperty("parties")[0].GetProperty("name").GetString());
        Assert.Equal(5, data.GetProperty("parties")[0].GetProperty("guests").GetArrayLength());
        Assert.Equal(HttpStatusCode.NotFound, other.StatusCode);
        factory.Clock.Advance(Duration.FromDays(8));
        using var later = await SignedInAsync();
        Assert.Equal(HttpStatusCode.Gone, (await later.Http.GetAsync(path, Cancel)).StatusCode);
    }

    [Fact]
    public async Task Deleting_warns_about_live_bookings_and_needs_the_email_typed()
    {
        using var browser = await SignedInAsync();

        var check = await browser.Http.GetFromJsonAsync<JsonElement>("/api/privacy/deletion-check", Cancel);
        var wrong = await browser.Http.PostAsJsonAsync("/api/privacy/delete-account", new { email = "someone@example.com" }, Cancel);

        Assert.Equal(1, check.GetProperty("liveBookings").GetInt32());
        Assert.Equal(HttpStatusCode.BadRequest, wrong.StatusCode);
        Assert.Equal("Type the email you sign in with, amara.okafor@example.com", (await wrong.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("errors").GetProperty("email")[0].GetString());
    }

    [Fact]
    public async Task Deleting_removes_the_account_its_parties_and_family_and_co_planners_lose_access()
    {
        using var browser = await SignedInAsync();
        using var kemi = factory.CreateClientFor(TestParent.Kemi);

        var deleted = await browser.Http.PostAsJsonAsync("/api/privacy/delete-account", new { email = TestParent.Amara.Email.ToUpperInvariant() }, Cancel);

        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await browser.Http.GetAsync("/api/session", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await kemi.GetAsync($"/api/parties/{party.Id}/overview", Cancel)).StatusCode);
        Assert.Equal((0, 0, 0, 0), await factory.QueryAsync(db => Task.FromResult((
            db.Parents.Count(p => p.Id == TestParent.Amara.Id),
            db.Parties.Count(),
            db.Guests.Count(),
            db.Families.Count(f => f.Id == TestParent.Amara.Id)))));
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    [Fact]
    public async Task Deleting_the_account_removes_thank_you_notes_ratings_and_saved_plans()
    {
        await factory.SeedAsync(db =>
        {
            var guest = db.Guests.First(g => g.PartyId == party.Id);
            var note = new Giddy.Domain.Wrapping.ThankYouNote(party.Id, guest.Id);
            note.Edit("Dino excavation kit", null);
            db.ThankYouNotes.Add(note);
            var rating = new Giddy.Domain.Wrapping.ProviderRating(party.Id, Guid.NewGuid());
            rating.Rate(5, "Wonderful", TestParent.Amara.Id, NodaTime.Instant.FromUtc(2026, 10, 20, 12, 0));
            db.ProviderRatings.Add(rating);
            db.PartyTemplates.Add(new Giddy.Domain.Wrapping.PartyTemplate(db.Parties.Find(party.Id)!, null, NodaTime.Instant.FromUtc(2026, 10, 20, 12, 0)));
        });
        using var browser = await SignedInAsync();

        await browser.Http.PostAsJsonAsync("/api/privacy/delete-account", new { email = TestParent.Amara.Email }, Cancel);

        Assert.Equal((0, 0, 0), await factory.QueryAsync(db => Task.FromResult((db.ThankYouNotes.Count(), db.ProviderRatings.Count(), db.PartyTemplates.Count()))));
    }

    private async Task<AccountClient> SignedInAsync()
    {
        var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/sign-in", new { email = TestParent.Amara.Email, password = Accounts.Password, keepSignedIn = false });
        return browser;
    }

    [GeneratedRegex(@"/api/privacy/exports/[0-9a-f-]+")]
    private static partial Regex Link();
}
