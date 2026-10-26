using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Families;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-007: adding and editing children.</summary>
public sealed class FamilyTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Families.Add(new Family(TestParent.Kemi.Id, "M4M 1H1"));
    });

    [Fact]
    public async Task A_child_is_saved_with_their_next_birthday_and_the_days_until_it()
    {
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);

        var added = await kemi.PostAsJsonAsync("/api/family/children", new { firstName = "Ama", birthday = "2021-12-20", interests = new[] { "Dinosaurs", "Art" }, allergies = "Egg" }, Cancel);

        Assert.Equal(HttpStatusCode.Created, added.StatusCode);
        var child = (await kemi.GetFromJsonAsync<JsonElement>("/api/family", Cancel)).GetProperty("children").EnumerateArray().Single(c => c.GetProperty("firstName").GetString() == "Ama");
        Assert.Equal(("2026-12-20", 5, 56), (child.GetProperty("nextBirthday").GetString(), child.GetProperty("turningAge").GetInt32(), child.GetProperty("daysUntil").GetInt32()));
        Assert.Equal(["Dinosaurs", "Art"], child.GetProperty("interests").EnumerateArray().Select(i => i.GetString()));
        Assert.Equal("Egg", child.GetProperty("allergies").GetString());
    }

    [Fact]
    public async Task A_birthday_in_the_future_a_missing_name_and_a_sixth_interest_are_refused()
    {
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);

        var response = await kemi.PostAsJsonAsync("/api/family/children", new { firstName = " ", birthday = "2026-10-25", interests = new[] { "Dinosaurs", "Art", "Space", "Trains", "Ocean", "Sports" }, allergies = (string?)null }, Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("errors");
        Assert.Equal("Enter your child’s first name", errors.GetProperty("firstName")[0].GetString());
        Assert.Equal("Enter a birthday in the past, like 14 Nov 2019", errors.GetProperty("birthday")[0].GetString());
        Assert.Equal("Pick up to 5", errors.GetProperty("interests")[0].GetString());
    }

    [Fact]
    public async Task Interests_come_from_Giddys_list()
    {
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);

        var interests = await kemi.GetFromJsonAsync<JsonElement>("/api/family/interests", Cancel);
        var unknown = await kemi.PostAsJsonAsync("/api/family/children", new { firstName = "Ama", birthday = "2021-12-20", interests = new[] { "Hacking" }, allergies = (string?)null }, Cancel);

        Assert.Contains(("Dinosaurs", "🦕"), interests.EnumerateArray().Select(i => (i.GetProperty("name").GetString(), i.GetProperty("emoji").GetString())));
        Assert.Equal(HttpStatusCode.BadRequest, unknown.StatusCode);
    }

    [Fact]
    public async Task A_child_is_edited_and_removed()
    {
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);
        var added = await (await kemi.PostAsJsonAsync("/api/family/children", new { firstName = "Ama", birthday = "2021-12-20", interests = Array.Empty<string>(), allergies = (string?)null }, Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);
        var url = $"/api/family/children/{added.GetProperty("id").GetGuid()}";

        var edited = await kemi.PutAsJsonAsync(url, new { firstName = "Ama Rose", birthday = "2021-12-21", interests = new[] { "Ocean" }, allergies = "Egg" }, Cancel);
        var afterEdit = (await kemi.GetFromJsonAsync<JsonElement>("/api/family", Cancel)).GetProperty("children")[0];
        var removed = await kemi.DeleteAsync(url, Cancel);
        var afterRemove = (await kemi.GetFromJsonAsync<JsonElement>("/api/family", Cancel)).GetProperty("children");

        Assert.Equal(HttpStatusCode.OK, edited.StatusCode);
        Assert.Equal(("Ama Rose", "2021-12-21"), (afterEdit.GetProperty("firstName").GetString(), afterEdit.GetProperty("birthday").GetString()));
        Assert.Equal(HttpStatusCode.NoContent, removed.StatusCode);
        Assert.Empty(afterRemove.EnumerateArray());
    }

    [Fact]
    public async Task Another_family_cannot_change_a_child()
    {
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var zuri = (await amara.GetFromJsonAsync<JsonElement>("/api/family", Cancel)).GetProperty("children").EnumerateArray().First();

        var edit = await kemi.PutAsJsonAsync($"/api/family/children/{zuri.GetProperty("id").GetGuid()}", new { firstName = "Mine", birthday = "2019-11-14", interests = Array.Empty<string>(), allergies = (string?)null }, Cancel);
        var remove = await kemi.DeleteAsync($"/api/family/children/{zuri.GetProperty("id").GetGuid()}", Cancel);

        Assert.Equal((HttpStatusCode.NotFound, HttpStatusCode.NotFound), (edit.StatusCode, remove.StatusCode));
    }

    [Fact]
    public async Task Home_shows_the_next_birthday_only_within_120_days()
    {
        await factory.SeedAsync(db =>
        {
            var family = db.Families.Find(TestParent.Kemi.Id)!;
            family.AddChild(new Child(Guid.NewGuid(), "Ama", new LocalDate(2021, 6, 1)));
        });
        using var kemi = factory.CreateClientFor(TestParent.Kemi);

        var home = await kemi.GetFromJsonAsync<JsonElement>("/api/home", Cancel);

        Assert.Equal(JsonValueKind.Null, home.GetProperty("nextBirthday").ValueKind);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
