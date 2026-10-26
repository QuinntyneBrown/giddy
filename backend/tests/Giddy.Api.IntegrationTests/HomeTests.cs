using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-062 to L2-064: Home and Giddy's nudges.</summary>
public sealed class HomeTests : IDisposable
{
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Home_shows_the_soonest_party_its_readiness_and_the_next_birthday_not_yet_planned()
    {
        var dinoParty = TestData.DinoParty().WithPlan(doneTasks: 3, confirmedBookings: 1);
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.Add(dinoParty);
        });
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var home = await amara.GetFromJsonAsync<JsonElement>("/api/home", Cancel);

        Assert.Equal(1, home.GetProperty("partiesInProgress").GetInt32());
        Assert.Equal(1, home.GetProperty("needsYou").GetInt32());
        var hero = home.GetProperty("nextParty");
        Assert.Equal(dinoParty.Id, hero.GetProperty("id").GetGuid());
        Assert.Equal(20, hero.GetProperty("daysToGo").GetInt32());
        Assert.Equal(27, hero.GetProperty("readiness").GetInt32());
        Assert.Equal("Dino Den Play Café", hero.GetProperty("venueName").GetString());
        Assert.Equal("Book Professor Fizz’s Volcano Lab", hero.GetProperty("nextStep").GetString());
        var birthday = home.GetProperty("nextBirthday");
        Assert.Equal(("Kofi", 4, "2027-02-03"), (birthday.GetProperty("firstName").GetString(), birthday.GetProperty("turningAge").GetInt32(), birthday.GetProperty("date").GetString()));
    }

    [Fact]
    public async Task Nudges_put_overdue_first_then_this_week_and_show_at_most_three()
    {
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.Add(TestData.DinoParty().WithPlan(doneTasks: 1));
        });
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var nudges = (await amara.GetFromJsonAsync<JsonElement>("/api/home/nudges", Cancel)).EnumerateArray().ToList();

        Assert.Equal(3, nudges.Count);
        Assert.Equal(["overdue", "overdue", "needsYou"], nudges.Select(n => n.GetProperty("kind").GetString()!));
        Assert.Equal("Book the entertainer", nudges[0].GetProperty("title").GetString());
        Assert.Equal("It was due Tue 20 Oct.", nudges[0].GetProperty("context").GetString());
        Assert.Equal("Order the cake", nudges[2].GetProperty("title").GetString());
    }

    [Fact]
    public async Task Finished_tasks_are_no_longer_nudged()
    {
        await factory.SeedAsync(db =>
        {
            TestData.AddPeople(db);
            db.Parties.Add(TestData.DinoParty().WithPlan(doneTasks: 2));
        });
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var nudges = (await amara.GetFromJsonAsync<JsonElement>("/api/home/nudges", Cancel)).EnumerateArray().ToList();

        Assert.Equal(["Send invitations", "Order the cake"], nudges.Select(n => n.GetProperty("title").GetString()!));
    }

    [Fact]
    public async Task A_parent_with_no_parties_gets_an_empty_home()
    {
        await factory.SeedAsync(TestData.AddPeople);
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var home = await amara.GetFromJsonAsync<JsonElement>("/api/home", Cancel);

        Assert.Equal(JsonValueKind.Null, home.GetProperty("nextParty").ValueKind);
        Assert.Equal(0, home.GetProperty("partiesInProgress").GetInt32());
        Assert.Equal("Zuri", home.GetProperty("nextBirthday").GetProperty("firstName").GetString());
    }

    public void Dispose() => factory.Dispose();
}
