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

/// <summary>L2-050 and L2-051: the party-day run sheet, and ticking tasks offline with conflicts.</summary>
public sealed class RunSheetTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan(confirmedBookings: 1);
    private readonly Party draft = TestData.DinoParty(new LocalDate(2026, 11, 21));
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.AddRange(dinoParty, draft);
        db.CatalogueItems.AddRange(DemoCatalogue.Items());
        var guests = TestData.GuestsFor(dinoParty);
        var now = Instant.FromUtc(2026, 10, 24, 12, 0);
        guests[0].Reply(true, "Dairy-free", null, null, "Lily Chen", null, null, now);
        guests[1].Reply(true, "Peanut (EpiPen with parent)", null, null, "Priya Patel", null, null, now);
        guests[2].Reply(true, null, null, null, "Marco Rossi", null, null, now);
        guests[3].Reply(false, "Gluten-free", null, null, "Hodan Mohamed", null, null, now);
        db.Guests.AddRange(guests);
    });

    [Fact]
    public async Task A_party_without_a_run_sheet_offers_to_draft_one()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var sheet = await amara.GetFromJsonAsync<JsonElement>(SheetUrl(dinoParty), Cancel);

        Assert.Empty(sheet.GetProperty("steps").EnumerateArray());
        Assert.Equal(("2026-11-14", "13:00", "15:30", 3), (sheet.GetProperty("date").GetString(), sheet.GetProperty("startsAt").GetString(), sheet.GetProperty("endsAt").GetString(), sheet.GetProperty("coming").GetInt32()));
    }

    [Fact]
    public async Task Giddy_drafts_timed_steps_from_set_up_to_pick_up_with_who_and_the_key_reminder()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var drafted = await amara.PostAsync($"{SheetUrl(dinoParty)}/draft", null, Cancel);

        Assert.Equal(HttpStatusCode.OK, drafted.StatusCode);
        var steps = (await drafted.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("steps").EnumerateArray().ToList();
        Assert.Equal(
            [("12:15", "Arrive and set up"), ("12:45", "Pizza Nonna delivery"), ("13:00", "Guests arrive"), ("13:30", "Professor Fizz’s Volcano Lab"), ("14:15", "Food and drinks"), ("14:45", "Cake and Happy Birthday"), ("15:10", "Loot bags"), ("15:30", "Pick-up and goodbyes")],
            steps.Select(s => (s.GetProperty("time").GetString(), s.GetProperty("title").GetString())));
        var food = steps[4];
        Assert.Equal("Peanut (EpiPen with parent) for Arjun · dairy-free for Maya", food.GetProperty("reminder").GetString());
        Assert.Equal("Professor Fizz’s Volcano Lab", steps[3].GetProperty("who").GetString());
        Assert.Contains("45 min", steps[3].GetProperty("details").GetString());
        Assert.Equal("Amara", steps[0].GetProperty("who").GetString());
    }

    [Fact]
    public async Task The_run_sheet_has_quick_calls_and_the_allergy_list()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await amara.PostAsync($"{SheetUrl(dinoParty)}/draft", null, Cancel);

        var sheet = await amara.GetFromJsonAsync<JsonElement>(SheetUrl(dinoParty), Cancel);

        var contacts = sheet.GetProperty("contacts").EnumerateArray().Select(c => (c.GetProperty("name").GetString(), c.GetProperty("role").GetString(), c.GetProperty("phone").GetString())).ToList();
        Assert.Contains(("Bea", "Dino Den Play Café host", "4165550142"), contacts);
        Assert.Contains(("Professor Fizz’s Volcano Lab", "Entertainer", "4165550163"), contacts);
        Assert.Contains(("Pizza Nonna", "Food", "4165550110"), contacts);
        Assert.Equal(
            [("Arjun", "Peanut (EpiPen with parent)"), ("Maya", "Dairy-free")],
            sheet.GetProperty("allergies").EnumerateArray().Select(a => (a.GetProperty("child").GetString(), a.GetProperty("allergy").GetString())));
    }

    [Fact]
    public async Task Drafting_twice_is_a_conflict_and_viewers_cannot_draft()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);

        var byDev = await dev.PostAsync($"{SheetUrl(dinoParty)}/draft", null, Cancel);
        await amara.PostAsync($"{SheetUrl(dinoParty)}/draft", null, Cancel);
        var again = await amara.PostAsync($"{SheetUrl(dinoParty)}/draft", null, Cancel);
        var devReads = await dev.GetAsync(SheetUrl(dinoParty), Cancel);

        Assert.Equal((HttpStatusCode.Forbidden, HttpStatusCode.Conflict, HttpStatusCode.OK), (byDev.StatusCode, again.StatusCode, devReads.StatusCode));
    }

    [Fact]
    public async Task A_party_with_nothing_booked_cannot_be_drafted()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var drafted = await amara.PostAsync($"{SheetUrl(draft)}/draft", null, Cancel);

        Assert.Equal(HttpStatusCode.Conflict, drafted.StatusCode);
    }

    [Fact]
    public async Task A_tick_made_offline_syncs_when_nobody_else_changed_the_task()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var task = await FirstOpenTaskAsync(amara);

        var synced = await TickAsync(amara, task, task.GetProperty("version").GetString()!);

        Assert.Equal(HttpStatusCode.OK, synced.StatusCode);
        Assert.NotEqual(task.GetProperty("version").GetString(), (await synced.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("version").GetString());
    }

    [Fact]
    public async Task A_tick_made_offline_on_a_task_a_co_planner_changed_is_a_conflict_to_resolve()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);
        var task = await FirstOpenTaskAsync(amara);
        var id = task.GetProperty("id").GetGuid();
        await kemi.PutAsJsonAsync($"/api/parties/{dinoParty.Id}/tasks/{id}", new { title = "Book Professor Fizz", due = task.GetProperty("due").GetString(), ownerId = TestParent.Kemi.Id, remindMe = true }, Cancel);

        var stale = await TickAsync(amara, task, task.GetProperty("version").GetString()!);

        Assert.Equal(HttpStatusCode.PreconditionFailed, stale.StatusCode);
        var problem = await stale.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Kemi changed this task while you were offline.", problem.GetProperty("title").GetString());
        Assert.Equal(("Book Professor Fizz", false), (problem.GetProperty("current").GetProperty("title").GetString(), problem.GetProperty("current").GetProperty("done").GetBoolean()));
        var kept = await TickAsync(amara, task, problem.GetProperty("current").GetProperty("version").GetString()!);
        Assert.Equal(HttpStatusCode.OK, kept.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private static string SheetUrl(Party party) => $"/api/parties/{party.Id}/run-sheet";

    private async Task<JsonElement> FirstOpenTaskAsync(HttpClient client)
    {
        var checklist = await client.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/tasks", Cancel);
        return checklist.GetProperty("groups").EnumerateArray().First(g => g.GetProperty("name").GetString() == "Overdue").GetProperty("tasks")[0];
    }

    private Task<HttpResponseMessage> TickAsync(HttpClient client, JsonElement task, string version)
    {
        var request = new HttpRequestMessage(HttpMethod.Put, $"/api/parties/{dinoParty.Id}/tasks/{task.GetProperty("id").GetGuid()}/done")
        {
            Content = JsonContent.Create(new { done = true }),
        };
        request.Headers.IfMatch.Add(new System.Net.Http.Headers.EntityTagHeaderValue($"\"{version}\""));
        return client.SendAsync(request, Cancel);
    }
}
