using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Application.Notifications;
using Giddy.Application.Wrapping;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-052 to L2-054: thank-you notes, ratings, final numbers and reuse after the party.</summary>
public sealed class WrapUpTests : IAsyncLifetime
{
    private static readonly DateTimeZone Toronto = DateTimeZoneProviders.Tzdb["America/Toronto"];
    private readonly GiddyApiFactory factory = new();
    private readonly Party past = TestData.DinoParty(new LocalDate(2026, 10, 17)).WithPlan();
    private readonly Party upcoming = TestData.DinoParty();
    private IReadOnlyList<Guest> guests = [];
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync()
    {
        past.RecordVenueBooked(DemoCatalogue.DinoDen, "Dino Den Play Café", 340, 100, new LocalTime(13, 0), new LocalTime(15, 30));
        past.RecordQuoteRequested(DemoCatalogue.ProfessorFizz, "Professor Fizz’s Volcano Lab", "Entertainer", 195);
        past.RecordQuote(DemoCatalogue.ProfessorFizz, "Professor Fizz’s Volcano Lab", "Entertainer", 195);
        past.RecordVendorConfirmed(DemoCatalogue.ProfessorFizz, "Professor Fizz’s Volcano Lab");
        guests = TestData.GuestsFor(past);
        var replied = Instant.FromUtc(2026, 10, 10, 15, 0);
        foreach (var guest in guests)
        {
            guest.Reply(guest.ChildName != "Aisha Mohamed", null, null, null, guest.ParentName, guest.Mobile, null, replied);
        }

        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.AddRange(past, upcoming);
            db.Guests.AddRange(guests);
            db.CatalogueItems.AddRange(DemoCatalogue.Items());
        });
    }

    [Fact]
    public async Task Before_the_party_wrap_up_says_when_it_opens()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var wrapUp = await amara.GetFromJsonAsync<JsonElement>(WrapUpUrl(upcoming), Cancel);

        Assert.False(wrapUp.GetProperty("open").GetBoolean());
        Assert.Equal("2026-11-15", wrapUp.GetProperty("opensOn").GetString());
        Assert.Equal(0, wrapUp.GetProperty("notes").GetArrayLength());
    }

    [Fact]
    public async Task After_the_party_there_is_a_draft_note_for_each_guest_who_came()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var wrapUp = await amara.GetFromJsonAsync<JsonElement>(WrapUpUrl(past), Cancel);

        Assert.True(wrapUp.GetProperty("open").GetBoolean());
        var notes = wrapUp.GetProperty("notes").EnumerateArray().ToList();
        Assert.Equal(["Arjun Patel", "Ava Wilson", "Leo Rossi", "Maya Chen"], notes.Select(n => n.GetProperty("childName").GetString()));
        Assert.All(notes, n => Assert.Equal("draft", n.GetProperty("status").GetString()));
        Assert.Equal("Thank you so much for coming to my party, Maya! It was so fun celebrating with you. Love, Zuri", notes[3].GetProperty("message").GetString());
        Assert.False(notes[1].GetProperty("canSend").GetBoolean());
    }

    [Fact]
    public async Task A_logged_gift_is_mentioned_and_an_edited_note_is_kept()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var maya = guests.Single(g => g.ChildName == "Maya Chen");
        var leo = guests.Single(g => g.ChildName == "Leo Rossi");

        var gift = await amara.PutAsJsonAsync(NoteUrl(past, maya), new { gift = "Dino excavation kit", message = (string?)null }, Cancel);
        var edited = await amara.PutAsJsonAsync(NoteUrl(past, leo), new { gift = "T. rex plush", message = "Leo, the T. rex sleeps in Zuri’s bed now. Thank you! Love, Zuri" }, Cancel);
        var wrapUp = await amara.GetFromJsonAsync<JsonElement>(WrapUpUrl(past), Cancel);

        Assert.Equal(HttpStatusCode.OK, gift.StatusCode);
        Assert.Equal(HttpStatusCode.OK, edited.StatusCode);
        var notes = wrapUp.GetProperty("notes").EnumerateArray().ToDictionary(n => n.GetProperty("childName").GetString()!);
        Assert.Equal("Thank you so much for the Dino excavation kit, Maya! Zuri hasn’t put it down. It was so fun celebrating with you. Love, Zuri", notes["Maya Chen"].GetProperty("message").GetString());
        Assert.Equal("Leo, the T. rex sleeps in Zuri’s bed now. Thank you! Love, Zuri", notes["Leo Rossi"].GetProperty("message").GetString());
        Assert.Equal(2, wrapUp.GetProperty("numbers").GetProperty("gifts").GetInt32());
    }

    [Fact]
    public async Task An_empty_note_is_refused()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PutAsJsonAsync(NoteUrl(past, guests[0]), new { gift = (string?)null, message = "  " }, Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Write a note, or keep Giddy’s draft", problem.GetProperty("errors").GetProperty("message")[0].GetString());
    }

    [Fact]
    public async Task Sending_emails_each_guests_parent_once_and_marks_the_notes_sent()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var sent = await amara.PostAsync($"{NotesUrl(past)}/send", null, Cancel);
        var again = await amara.PostAsync($"{NotesUrl(past)}/send", null, Cancel);
        await DispatchAsync();

        Assert.Equal(HttpStatusCode.OK, sent.StatusCode);
        Assert.Equal(3, (await sent.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("sent").GetInt32());
        Assert.Equal(0, (await again.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("sent").GetInt32());
        Assert.Equal(["lily.chen@example.com", "marco.rossi@example.com", "priya.patel@example.com"], factory.Email.Sent.Select(e => e.To).Order());
        Assert.All(factory.Email.Sent, e => Assert.Equal("A thank-you from Zuri", e.Subject));
        var wrapUp = await amara.GetFromJsonAsync<JsonElement>(WrapUpUrl(past), Cancel);
        Assert.Equal(["sent", "draft", "sent", "sent"], wrapUp.GetProperty("notes").EnumerateArray().Select(n => n.GetProperty("status").GetString()));
    }

    [Fact]
    public async Task Viewers_see_wrap_up_but_cannot_send_or_rate()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);

        var read = await dev.GetAsync(WrapUpUrl(past), Cancel);
        var send = await dev.PostAsync($"{NotesUrl(past)}/send", null, Cancel);
        var rate = await dev.PutAsJsonAsync(RatingUrl(past, DemoCatalogue.DinoDen), new { stars = 5 }, Cancel);

        Assert.Equal(HttpStatusCode.OK, read.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, send.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, rate.StatusCode);
    }

    [Fact]
    public async Task Strangers_cannot_see_wrap_up()
    {
        using var stranger = factory.CreateClientFor(TestParent.Stranger);

        var response = await stranger.GetAsync(WrapUpUrl(past), Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Booked_businesses_can_be_rated_and_count_in_their_public_rating()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var before = await VenueRatingAsync();

        var rated = await amara.PutAsJsonAsync(RatingUrl(past, DemoCatalogue.DinoDen), new { stars = 5, review = "The staff ran the fossil dig for us." }, Cancel);
        var changed = await amara.PutAsJsonAsync(RatingUrl(past, DemoCatalogue.DinoDen), new { stars = 4, review = (string?)null }, Cancel);
        var after = await VenueRatingAsync();
        var wrapUp = await amara.GetFromJsonAsync<JsonElement>(WrapUpUrl(past), Cancel);

        Assert.Equal((HttpStatusCode.OK, HttpStatusCode.OK), (rated.StatusCode, changed.StatusCode));
        Assert.Equal(before.Count + 1, after.Count);
        Assert.Equal(Math.Round(((before.Rating * before.Count) + 4) / (before.Count + 1), 2), Math.Round(after.Rating, 2));
        var providers = wrapUp.GetProperty("providers").EnumerateArray().ToList();
        Assert.Equal(["Dino Den Play Café", "Professor Fizz’s Volcano Lab"], providers.Select(p => p.GetProperty("name").GetString()));
        Assert.Equal(4, providers[0].GetProperty("stars").GetInt32());
        Assert.Equal(JsonValueKind.Null, providers[1].GetProperty("stars").ValueKind);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public async Task Ratings_are_one_to_five_stars(int stars)
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PutAsJsonAsync(RatingUrl(past, DemoCatalogue.DinoDen), new { stars }, Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Only_businesses_booked_in_the_plan_can_be_rated()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PutAsJsonAsync(RatingUrl(past, DemoCatalogue.BeachesPlayLoft), new { stars = 1 }, Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Final_numbers_show_kids_spend_and_gifts()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var numbers = (await amara.GetFromJsonAsync<JsonElement>(WrapUpUrl(past), Cancel)).GetProperty("numbers");

        Assert.Equal((4, 5, 778m, 800m, 0), (numbers.GetProperty("kidsCame").GetInt32(), numbers.GetProperty("invited").GetInt32(), numbers.GetProperty("spent").GetDecimal(), numbers.GetProperty("budget").GetDecimal(), numbers.GetProperty("gifts").GetInt32()));
    }

    [Fact]
    public async Task A_saved_template_starts_a_new_party_with_the_same_theme_vendors_and_checklist()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var saved = await amara.PostAsync($"/api/parties/{past.Id}/template", null, Cancel);
        var template = await saved.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        var created = await amara.PostAsJsonAsync("/api/parties", new
        {
            childId = TestData.Zuri,
            date = "2027-11-13",
            guests = 16,
            timeOfDay = "afternoon",
            budget = 850,
            postalCode = "M4M 1H1",
            templateId = template.GetProperty("templateId").GetGuid(),
        }, Cancel);
        var party = await created.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        var copy = await factory.QueryAsync(db => db.Parties.SingleAsync(p => p.Id == party.GetProperty("id").GetGuid(), Cancel));

        Assert.Equal(HttpStatusCode.Created, saved.StatusCode);
        Assert.Equal("2027-09-19", template.GetProperty("remindOn").GetString());
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        Assert.Equal("Dino Dig", copy.Theme);
        Assert.Equal(past.BookingsToDo.Select(b => b.Name), copy.BookingsToDo.Select(b => b.Name));
        Assert.All(copy.BookingsToDo, b => Assert.Equal(BookingStatus.ToBook, b.Status));
        Assert.Equal(DemoCatalogue.DinoDen, copy.BookingsToDo.Single(b => b.Category == "Venue").CatalogueItemId);
        Assert.Equal(past.Checklist.Select(t => t.Title), copy.Checklist.Select(t => t.Title));
        Assert.All(copy.Checklist, t => Assert.False(t.Done));
        Assert.Equal(past.Checklist.Select(t => Period.Between(t.Due, past.Date, PeriodUnits.Days).Days), copy.Checklist.Select(t => Period.Between(t.Due, copy.Date, PeriodUnits.Days).Days));
    }

    [Fact]
    public async Task Saving_the_template_again_keeps_one()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var first = await (await amara.PostAsync($"/api/parties/{past.Id}/template", null, Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);
        var second = await amara.PostAsync($"/api/parties/{past.Id}/template", null, Cancel);

        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        Assert.Equal(first.GetProperty("templateId").GetGuid(), (await second.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("templateId").GetGuid());
        var wrapUp = await amara.GetFromJsonAsync<JsonElement>(WrapUpUrl(past), Cancel);
        Assert.Equal("2027-09-19", wrapUp.GetProperty("template").GetProperty("remindOn").GetString());
    }

    [Fact]
    public async Task A_birthday_less_than_eight_weeks_away_moves_the_reminder_to_the_year_after()
    {
        var sixth = Party.Plan(Guid.NewGuid(), "Zuri’s 6th: Mermaid Splash", new LocalDate(2025, 11, 15), new LocalTime(13, 0), new LocalTime(15, 0), TestParent.Amara.Id);
        sixth.Describe("Zuri", 6, new PartyArea("Leslieville", DemoCatalogue.LeslievilleLatitude, DemoCatalogue.LeslievilleLongitude, 8), 14, 720, TestData.Zuri);
        await factory.SeedAsync(db => db.Parties.Add(sixth));
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var template = await (await amara.PostAsync($"/api/parties/{sixth.Id}/template", null, Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);

        Assert.Equal("2027-09-19", template.GetProperty("remindOn").GetString());
    }

    [Fact]
    public async Task Eight_weeks_before_the_next_birthday_Giddy_reminds_the_parent_once()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var template = await (await amara.PostAsync($"/api/parties/{past.Id}/template", null, Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);
        factory.Email.Sent.Clear();
        At(2027, 9, 19, 9, 30);

        await RemindAsync();
        await RemindAsync();

        var reminder = Assert.Single(factory.Email.Sent);
        Assert.Equal((TestParent.Amara.Email, "Plan Zuri’s 8th from last year’s party?"), (reminder.To, reminder.Subject));
        Assert.Contains($"/parties/new?template={template.GetProperty("templateId").GetGuid()}", reminder.Body);
    }

    [Fact]
    public async Task The_template_is_shown_to_its_owner_for_starting_a_party()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        using var stranger = factory.CreateClientFor(TestParent.Stranger);
        var template = await (await amara.PostAsync($"/api/parties/{past.Id}/template", null, Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);
        var url = $"/api/templates/{template.GetProperty("templateId").GetGuid()}";

        var mine = await amara.GetFromJsonAsync<JsonElement>(url, Cancel);
        var theirs = await stranger.GetAsync(url, Cancel);

        Assert.Equal(("Zuri’s Dino Dig 7th", "Dino Dig"), (mine.GetProperty("name").GetString(), mine.GetProperty("theme").GetString()));
        Assert.Equal(HttpStatusCode.NotFound, theirs.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private static string WrapUpUrl(Party party) => $"/api/parties/{party.Id}/wrap-up";

    private static string NotesUrl(Party party) => $"/api/parties/{party.Id}/thank-yous";

    private static string NoteUrl(Party party, Guest guest) => $"{NotesUrl(party)}/{guest.Id}";

    private static string RatingUrl(Party party, Guid providerId) => $"/api/parties/{party.Id}/ratings/{providerId}";

    private Task<(decimal Rating, int Count)> VenueRatingAsync() => factory.QueryAsync(async db =>
    {
        var item = await db.CatalogueItems.SingleAsync(i => i.Id == DemoCatalogue.DinoDen, Cancel);
        return (item.Venue!.Rating, item.Venue.ReviewCount);
    });

    private void At(int year, int month, int day, int hour, int minute) =>
        factory.Clock.Reset(new LocalDateTime(year, month, day, hour, minute).InZoneLeniently(Toronto).ToInstant());

    private async Task DispatchAsync()
    {
        using var scope = factory.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<NotificationOutbox>().DispatchDueAsync(Cancel);
    }

    private async Task RemindAsync()
    {
        using var scope = factory.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<TemplateReminders>().RunAsync(Cancel);
        await scope.ServiceProvider.GetRequiredService<NotificationOutbox>().DispatchDueAsync(Cancel);
    }
}
