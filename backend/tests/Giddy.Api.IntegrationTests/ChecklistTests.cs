using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-047 and L2-048: the dated checklist, ticking, adding and assigning tasks, and tasks Giddy can do.</summary>
public sealed class ChecklistTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan(doneTasks: 1, confirmedBookings: 1);
    private readonly Party draft = TestData.DinoParty(new NodaTime.LocalDate(2026, 11, 21));
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.AddRange(dinoParty, draft);
    });

    [Fact]
    public async Task Tasks_are_dated_back_from_the_party_and_grouped_by_when_they_are_due()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var checklist = await amara.GetFromJsonAsync<JsonElement>(TasksUrl(dinoParty), Cancel);

        Assert.Equal((1, 10, 10, 2), (checklist.GetProperty("done").GetInt32(), checklist.GetProperty("total").GetInt32(), checklist.GetProperty("percent").GetInt32(), checklist.GetProperty("overdue").GetInt32()));
        Assert.Equal(["Overdue", "This week", "Before the party", "Done"], Groups(checklist).Select(g => g.GetProperty("name").GetString()));
        var overdue = Tasks(checklist, "Overdue");
        Assert.Equal(["Book the entertainer", "Send invitations"], overdue.Select(t => t.GetProperty("title").GetString()));
        Assert.True(overdue[0].GetProperty("overdue").GetBoolean());
        Assert.Equal("2026-10-20", overdue[0].GetProperty("due").GetString());
        var before = Tasks(checklist, "Before the party");
        Assert.Equal(("Order the cake", "2026-11-04"), (before[0].GetProperty("title").GetString(), before[0].GetProperty("due").GetString()));
        Assert.Equal(("Order the food", "2026-11-12"), Pair(before.Single(t => t.GetProperty("title").GetString() == "Order the food")));
        Assert.Equal(("Pack the party-day kit", "2026-11-13"), Pair(before[^1]));
        Assert.Equal("allergyList", before.Single(t => t.GetProperty("title").GetString() == "Share the allergy list with the venue").GetProperty("giddyCanDo").GetString());
        Assert.Equal(JsonValueKind.Null, before[0].GetProperty("giddyCanDo").ValueKind);
        Assert.Equal(["Book the venue"], Tasks(checklist, "Done").Select(t => t.GetProperty("title").GetString()));
        Assert.Equal(TestParent.Amara.Id, before[0].GetProperty("ownerId").GetGuid());
    }

    [Fact]
    public async Task Ticking_a_task_moves_it_to_done_updates_readiness_and_tells_the_other_planners()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);
        var amaraCursor = (await amara.GetFromJsonAsync<JsonElement>("/api/live-updates", Cancel)).GetProperty("cursor").GetInt64();
        var kemiCursor = (await kemi.GetFromJsonAsync<JsonElement>("/api/live-updates", Cancel)).GetProperty("cursor").GetInt64();
        var before = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/overview", Cancel);
        var task = Tasks(await amara.GetFromJsonAsync<JsonElement>(TasksUrl(dinoParty), Cancel), "Overdue")[0];

        var ticked = await kemi.PutAsJsonAsync($"{TasksUrl(dinoParty)}/{task.GetProperty("id").GetGuid()}/done", new { done = true }, Cancel);

        Assert.Equal(HttpStatusCode.OK, ticked.StatusCode);
        var checklist = await amara.GetFromJsonAsync<JsonElement>(TasksUrl(dinoParty), Cancel);
        Assert.Contains("Book the entertainer", Tasks(checklist, "Done").Select(t => t.GetProperty("title").GetString()));
        Assert.Equal(2, checklist.GetProperty("done").GetInt32());
        var after = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/overview", Cancel);
        Assert.True(after.GetProperty("readiness").GetInt32() > before.GetProperty("readiness").GetInt32());
        var forAmara = (await amara.GetFromJsonAsync<JsonElement>($"/api/live-updates?after={amaraCursor}", Cancel)).GetProperty("events").EnumerateArray().ToList();
        var news = Assert.Single(forAmara);
        Assert.Equal(("task", "Kemi ticked off Book the entertainer"), (news.GetProperty("kind").GetString(), news.GetProperty("title").GetString()));
        Assert.Empty((await kemi.GetFromJsonAsync<JsonElement>($"/api/live-updates?after={kemiCursor}", Cancel)).GetProperty("events").EnumerateArray());
    }

    [Fact]
    public async Task A_task_added_for_a_co_planner_appears_in_date_order()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var added = await amara.PostAsJsonAsync(TasksUrl(dinoParty), new { title = "Buy number 7 candle and a lighter", due = "2026-11-12", ownerId = TestParent.Kemi.Id, remindMe = true }, Cancel);

        Assert.Equal(HttpStatusCode.Created, added.StatusCode);
        var before = Tasks(await amara.GetFromJsonAsync<JsonElement>(TasksUrl(dinoParty), Cancel), "Before the party");
        var titles = before.Select(t => t.GetProperty("title").GetString()).ToList();
        Assert.Equal(titles.IndexOf("Order the food"), titles.IndexOf("Buy number 7 candle and a lighter") - 1);
        var candle = before.Single(t => t.GetProperty("title").GetString() == "Buy number 7 candle and a lighter");
        Assert.Equal((TestParent.Kemi.Id, "Kemi Okafor", true), (candle.GetProperty("ownerId").GetGuid(), candle.GetProperty("ownerName").GetString(), candle.GetProperty("remindMe").GetBoolean()));
    }

    [Fact]
    public async Task A_task_needs_a_title_a_date_by_the_party_and_someone_planning_it()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(TasksUrl(dinoParty), new { title = " ", due = "2026-11-20", ownerId = TestParent.Dev.Id, remindMe = false }, Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("errors");
        Assert.Equal("Say what needs doing", errors.GetProperty("title")[0].GetString());
        Assert.Equal("Choose a date on or before the party, Sat 14 Nov", errors.GetProperty("due")[0].GetString());
        Assert.Equal("Choose someone who is planning this party", errors.GetProperty("ownerId")[0].GetString());
    }

    [Fact]
    public async Task A_task_is_edited_and_deleted()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var task = Tasks(await amara.GetFromJsonAsync<JsonElement>(TasksUrl(dinoParty), Cancel), "Before the party")[0];
        var url = $"{TasksUrl(dinoParty)}/{task.GetProperty("id").GetGuid()}";

        var edited = await amara.PutAsJsonAsync(url, new { title = "Order the dino cake from Sweet Rex", due = "2026-11-05", ownerId = TestParent.Kemi.Id, remindMe = false }, Cancel);
        var afterEdit = await amara.GetFromJsonAsync<JsonElement>(TasksUrl(dinoParty), Cancel);
        var deleted = await amara.DeleteAsync(url, Cancel);
        var afterDelete = await amara.GetFromJsonAsync<JsonElement>(TasksUrl(dinoParty), Cancel);

        Assert.Equal(HttpStatusCode.OK, edited.StatusCode);
        var cake = Tasks(afterEdit, "Before the party").Single(t => t.GetProperty("id").GetGuid() == task.GetProperty("id").GetGuid());
        Assert.Equal(("Order the dino cake from Sweet Rex", "2026-11-05", "Kemi Okafor"), (cake.GetProperty("title").GetString(), cake.GetProperty("due").GetString(), cake.GetProperty("ownerName").GetString()));
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        Assert.Equal(9, afterDelete.GetProperty("total").GetInt32());
    }

    [Fact]
    public async Task Giddy_makes_a_checklist_for_a_party_with_none()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var empty = await amara.GetFromJsonAsync<JsonElement>(TasksUrl(draft), Cancel);

        var made = await amara.PostAsync($"{TasksUrl(draft)}/generate", null, Cancel);
        var again = await amara.PostAsync($"{TasksUrl(draft)}/generate", null, Cancel);

        Assert.Equal(0, empty.GetProperty("total").GetInt32());
        Assert.Equal(HttpStatusCode.OK, made.StatusCode);
        Assert.Equal(10, (await made.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("total").GetInt32());
        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
    }

    [Fact]
    public async Task Giddy_shares_the_allergy_list_and_ticks_the_task()
    {
        await factory.SeedAsync(db => db.Guests.AddRange(TestData.GuestsFor(dinoParty)));
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var task = Tasks(await amara.GetFromJsonAsync<JsonElement>(TasksUrl(dinoParty), Cancel), "Before the party")
            .Single(t => t.GetProperty("giddyCanDo").GetString() == "allergyList");

        var done = await amara.PostAsync($"{TasksUrl(dinoParty)}/{task.GetProperty("id").GetGuid()}/giddy", null, Cancel);

        Assert.Equal(HttpStatusCode.OK, done.StatusCode);
        Assert.Equal("Allergy list sent to Dino Den Play Café", (await done.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("message").GetString());
        Assert.Single(factory.Partner.AllergyLists);
        var checklist = await amara.GetFromJsonAsync<JsonElement>(TasksUrl(dinoParty), Cancel);
        Assert.Contains("Share the allergy list with the venue", Tasks(checklist, "Done").Select(t => t.GetProperty("title").GetString()));
    }

    [Fact]
    public async Task Viewers_see_the_checklist_but_cannot_change_it()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);
        var task = Tasks(await dev.GetFromJsonAsync<JsonElement>(TasksUrl(dinoParty), Cancel), "Overdue")[0];

        var tick = await dev.PutAsJsonAsync($"{TasksUrl(dinoParty)}/{task.GetProperty("id").GetGuid()}/done", new { done = true }, Cancel);
        var add = await dev.PostAsJsonAsync(TasksUrl(dinoParty), new { title = "Balloons", due = "2026-11-12", ownerId = TestParent.Amara.Id, remindMe = false }, Cancel);

        Assert.Equal((HttpStatusCode.Forbidden, HttpStatusCode.Forbidden), (tick.StatusCode, add.StatusCode));
    }

    [Fact]
    public async Task Strangers_cannot_see_the_checklist()
    {
        using var stranger = factory.CreateClientFor(TestParent.Stranger);

        var response = await stranger.GetAsync(TasksUrl(dinoParty), Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private static string TasksUrl(Party party) => $"/api/parties/{party.Id}/tasks";

    private static IEnumerable<JsonElement> Groups(JsonElement checklist) => checklist.GetProperty("groups").EnumerateArray();

    private static List<JsonElement> Tasks(JsonElement checklist, string group) =>
        Groups(checklist).Single(g => g.GetProperty("name").GetString() == group).GetProperty("tasks").EnumerateArray().ToList();

    private static (string?, string?) Pair(JsonElement task) => (task.GetProperty("title").GetString(), task.GetProperty("due").GetString());
}
