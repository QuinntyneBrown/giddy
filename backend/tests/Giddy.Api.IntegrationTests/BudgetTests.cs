using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-035 to L2-037: track the budget, add costs, and get back within budget.</summary>
public sealed class BudgetTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan(confirmedBookings: 1);
    private readonly Party draft = TestData.DinoParty(new NodaTime.LocalDate(2026, 11, 21));
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.AddRange(dinoParty, draft);
        db.CatalogueItems.AddRange(DemoCatalogue.Items());
    });

    [Fact]
    public async Task The_budget_shows_totals_categories_and_every_item()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var budget = await amara.GetFromJsonAsync<JsonElement>(BudgetUrl(dinoParty), Cancel);

        Assert.Equal((800m, 778m, 0m, 22m, 52m), (budget.GetProperty("budget").GetDecimal(), budget.GetProperty("planned").GetDecimal(), budget.GetProperty("paid").GetDecimal(), budget.GetProperty("left").GetDecimal(), budget.GetProperty("perKid").GetDecimal()));
        Assert.False(budget.GetProperty("over").GetBoolean());
        Assert.Equal(["Venue", "Entertainer", "Cake", "Food", "Loot bags"], budget.GetProperty("categories").EnumerateArray().Select(c => c.GetProperty("category").GetString()));
        var venue = budget.GetProperty("lines")[0];
        Assert.Equal(("Venue", "Dino Den Play Café", "booked", 340m, 0m), (venue.GetProperty("category").GetString(), venue.GetProperty("name").GetString(), venue.GetProperty("status").GetString(), venue.GetProperty("planned").GetDecimal(), venue.GetProperty("paid").GetDecimal()));
        Assert.Equal("estimate", budget.GetProperty("lines")[1].GetProperty("status").GetString());
    }

    [Fact]
    public async Task Deposits_and_quotes_show_without_the_parent_editing_anything()
    {
        await factory.SeedAsync(db =>
        {
            var party = db.Parties.Find(dinoParty.Id)!;
            party.RecordVenueBooked(DemoCatalogue.DinoDen, "Dino Den Play Café", 340, 100, new NodaTime.LocalTime(13, 0), new NodaTime.LocalTime(15, 30));
            party.RecordQuote(DemoCatalogue.ProfessorFizz, "Professor Fizz’s Volcano Lab", "Entertainer", 180);
        });
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var budget = await amara.GetFromJsonAsync<JsonElement>(BudgetUrl(dinoParty), Cancel);

        var lines = budget.GetProperty("lines").EnumerateArray().ToList();
        Assert.Equal(("depositPaid", 100m), (lines[0].GetProperty("status").GetString(), lines[0].GetProperty("paid").GetDecimal()));
        Assert.Equal(("quoted", 180m), (lines[1].GetProperty("status").GetString(), lines[1].GetProperty("planned").GetDecimal()));
        Assert.Equal((763m, 100m), (budget.GetProperty("planned").GetDecimal(), budget.GetProperty("paid").GetDecimal()));
    }

    [Fact]
    public async Task A_cost_is_added_edited_and_deleted_with_the_totals()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var added = await amara.PostAsJsonAsync($"{BudgetUrl(dinoParty)}/lines", Cost("Dino balloons and banner", 22m, paid: true), Cancel);
        var line = await added.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        var afterAdd = await amara.GetFromJsonAsync<JsonElement>(BudgetUrl(dinoParty), Cancel);
        await amara.PutAsJsonAsync($"{BudgetUrl(dinoParty)}/lines/{line.GetProperty("id").GetString()}", Cost("Dino balloons and banner", 30m, paid: false), Cancel);
        var afterEdit = await amara.GetFromJsonAsync<JsonElement>(BudgetUrl(dinoParty), Cancel);
        var deleted = await amara.DeleteAsync($"{BudgetUrl(dinoParty)}/lines/{line.GetProperty("id").GetString()}", Cancel);
        var afterDelete = await amara.GetFromJsonAsync<JsonElement>(BudgetUrl(dinoParty), Cancel);

        Assert.Equal(HttpStatusCode.Created, added.StatusCode);
        Assert.Equal((800m, 22m, 0m), (afterAdd.GetProperty("planned").GetDecimal(), afterAdd.GetProperty("paid").GetDecimal(), afterAdd.GetProperty("left").GetDecimal()));
        var cost = afterAdd.GetProperty("lines").EnumerateArray().Last();
        Assert.Equal(("expense", "Decorations", "paid"), (cost.GetProperty("kind").GetString(), cost.GetProperty("category").GetString(), cost.GetProperty("status").GetString()));
        Assert.Equal((808m, 0m), (afterEdit.GetProperty("planned").GetDecimal(), afterEdit.GetProperty("paid").GetDecimal()));
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        Assert.Equal(778m, afterDelete.GetProperty("planned").GetDecimal());
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(35.555)]
    public async Task Amounts_must_be_positive_with_at_most_two_decimals(double amount)
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync($"{BudgetUrl(dinoParty)}/lines", Cost("Balloons", (decimal)amount), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Enter an amount like 35 or 35.50", problem.GetProperty("errors").GetProperty("amount")[0].GetString());
    }

    [Fact]
    public async Task Over_budget_offers_a_swap_that_brings_the_total_back_within_budget()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await amara.PostAsJsonAsync($"{BudgetUrl(dinoParty)}/lines", Cost("Balloon arch", 40m), Cancel);

        var budget = await amara.GetFromJsonAsync<JsonElement>(BudgetUrl(dinoParty), Cancel);

        Assert.True(budget.GetProperty("over").GetBoolean());
        Assert.Equal(18m, budget.GetProperty("overBy").GetDecimal());
        var swap = Assert.Single(budget.GetProperty("swaps").EnumerateArray());
        Assert.Equal(("Entertainer", "Professor Fizz’s Volcano Lab", "Rexy the Dino Visit"), (swap.GetProperty("category").GetString(), swap.GetProperty("currentName").GetString(), swap.GetProperty("replacementName").GetString()));
        Assert.Equal((195m, 150m, 45m), (swap.GetProperty("currentPrice").GetDecimal(), swap.GetProperty("replacementPrice").GetDecimal(), swap.GetProperty("saving").GetDecimal()));

        var applied = await amara.PostAsJsonAsync($"{BudgetUrl(dinoParty)}/swaps", new { category = "Entertainer", replacementId = swap.GetProperty("replacementId").GetGuid() }, Cancel);

        Assert.Equal(HttpStatusCode.OK, applied.StatusCode);
        var after = await applied.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.False(after.GetProperty("over").GetBoolean());
        Assert.Equal(773m, after.GetProperty("planned").GetDecimal());
        Assert.Equal("Rexy the Dino Visit", after.GetProperty("lines")[1].GetProperty("name").GetString());
        Assert.Equal(0, after.GetProperty("swaps").GetArrayLength());
    }

    [Fact]
    public async Task A_party_with_no_costs_can_be_filled_in_from_the_plan()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var empty = await amara.GetFromJsonAsync<JsonElement>(BudgetUrl(draft), Cancel);

        var filled = await amara.PostAsync($"{BudgetUrl(draft)}/estimate", null, Cancel);
        var again = await amara.PostAsync($"{BudgetUrl(draft)}/estimate", null, Cancel);

        Assert.Equal(0, empty.GetProperty("lines").GetArrayLength());
        Assert.Equal(HttpStatusCode.OK, filled.StatusCode);
        var budget = await filled.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal(["Venue", "Entertainer", "Cake", "Food", "Loot bags"], budget.GetProperty("lines").EnumerateArray().Select(l => l.GetProperty("category").GetString()));
        Assert.All(budget.GetProperty("lines").EnumerateArray(), l => Assert.Equal("estimate", l.GetProperty("status").GetString()));
        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
    }

    [Fact]
    public async Task Viewers_see_the_budget_but_cannot_change_it()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);

        var read = await dev.GetAsync(BudgetUrl(dinoParty), Cancel);
        var write = await dev.PostAsJsonAsync($"{BudgetUrl(dinoParty)}/lines", Cost("Balloons", 10m), Cancel);

        Assert.Equal(HttpStatusCode.OK, read.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, write.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private static string BudgetUrl(Party party) => $"/api/parties/{party.Id}/budget";

    private static object Cost(string description, decimal amount, bool paid = false) => new
    {
        description,
        category = "Decorations",
        amount,
        paid,
    };
}
