using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-017 and L2-022: priced, grounded plans that respect availability, area and allergies.</summary>
public sealed class ProposePlanTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty();
    private ChatClient amara = null!;

    public async ValueTask InitializeAsync()
    {
        await factory.SeedAsync(db =>
        {
            db.Parties.Add(dinoParty);
            db.CatalogueItems.AddRange(DemoCatalogue.Items());
        });
        amara = new ChatClient(await factory.CreateBrowserClientFor(TestParent.Amara));
    }

    private ScriptedPlanningModel SearchEverything() => factory.Model.CallsTools(
        ("list_themes", new { interest = "dinosaurs" }),
        ("search_venues", null),
        ("find_entertainers", new { theme = "dinosaurs" }),
        ("find_cakes", null),
        ("find_food", null),
        ("find_loot_bags", new { theme = "dinosaurs" }));

    private static object Plan(params (Guid Id, string Detail)[] items) => new
    {
        title = "Zuri’s Dino Dig 7th",
        themeId = DemoCatalogue.DinoDigTheme,
        themeDetail = "Fossil hunt, volcano science, dino eggs",
        items = items.Select(i => new { catalogueItemId = i.Id, detail = i.Detail }),
    };

    [Fact]
    public async Task A_plan_lists_each_item_with_its_catalogue_price_and_a_total_against_the_budget()
    {
        SearchEverything()
            .CallsTool("propose_plan", Plan(
                (DemoCatalogue.DinoDen, "1:00–3:30 pm · up to 20 kids · nut-free kitchen"),
                (DemoCatalogue.ProfessorFizz, "45 min show"),
                (DemoCatalogue.SweetRex, "nut-free dino cake for 20"),
                (DemoCatalogue.PizzaNonna, "6 large pizzas and juice boxes"),
                (DemoCatalogue.FossilKits, "Mini fossil dig kits × 16")))
            .Replies("Here’s a plan that keeps you $22 under budget.");

        var (conversationId, turnId) = await amara.SendAsync("Plan Zuri’s party");
        await amara.WaitForTurnAsync(conversationId, turnId);

        var proposal = (await amara.LastGiddyMessageAsync()).GetProperty("proposal");
        Assert.Equal("Dino Dig", proposal.GetProperty("theme").GetProperty("name").GetString());
        var items = proposal.GetProperty("items").EnumerateArray().ToList();
        Assert.Equal(["Venue", "Entertainer", "Cake", "Food", "Loot bags"], items.Select(i => i.GetProperty("category").GetString()!));
        Assert.Equal([340m, 195m, 85m, 110m, 48m], items.Select(i => i.GetProperty("price").GetDecimal()));
        Assert.Equal(778m, proposal.GetProperty("total").GetDecimal());
        Assert.Equal(800m, proposal.GetProperty("budget").GetDecimal());
        Assert.Equal(0m, proposal.GetProperty("overBudgetBy").GetDecimal());
        Assert.Equal(6, (await amara.LastGiddyMessageAsync()).GetProperty("steps").GetArrayLength());
    }

    [Fact]
    public async Task Items_that_did_not_come_from_this_turns_searches_are_never_shown()
    {
        factory.Model
            .CallsTool("list_themes")
            .CallsTool("propose_plan", Plan((DemoCatalogue.DinoDen, "Invented without searching")))
            .Replies("Let me search first.");

        var (conversationId, turnId) = await amara.SendAsync("Plan it");
        await amara.WaitForTurnAsync(conversationId, turnId);

        Assert.Equal(System.Text.Json.JsonValueKind.Null, (await amara.LastGiddyMessageAsync()).GetProperty("proposal").ValueKind);
        Assert.Contains("was not in this turn's search results", factory.Model.AllShownText());
    }

    [Fact]
    public async Task A_venue_that_is_booked_on_the_party_date_is_rejected()
    {
        factory.Model.Requests.Clear();
        SearchEverything()
            .CallsTool("propose_plan", Plan((DemoCatalogue.DanforthPartyRoom, "3 hours")))
            .Replies("That one is booked.");

        var (conversationId, turnId) = await amara.SendAsync("Use Danforth Party Room");
        await amara.WaitForTurnAsync(conversationId, turnId);

        Assert.Equal(System.Text.Json.JsonValueKind.Null, (await amara.LastGiddyMessageAsync()).GetProperty("proposal").ValueKind);
    }

    [Fact]
    public async Task Food_that_conflicts_with_an_allergy_is_flagged_on_the_plan()
    {
        SearchEverything()
            .CallsTool("propose_plan", Plan((DemoCatalogue.DinoDen, "1:00–3:30 pm"), (DemoCatalogue.CakeCorner, "cake for 20")))
            .Replies("Cake Corner isn’t nut-free.");

        var (conversationId, turnId) = await amara.SendAsync("Cheapest cake");
        await amara.WaitForTurnAsync(conversationId, turnId);

        var items = (await amara.LastGiddyMessageAsync()).GetProperty("proposal").GetProperty("items").EnumerateArray().ToList();
        Assert.Equal(System.Text.Json.JsonValueKind.Null, items[0].GetProperty("allergyNote").ValueKind);
        Assert.Equal("Not peanut-free", items[1].GetProperty("allergyNote").GetString());
    }

    [Fact]
    public async Task A_plan_over_budget_says_by_how_much()
    {
        await factory.SeedAsync(db => db.Parties.Single(p => p.Id == dinoParty.Id).Describe(
            "Zuri", 7, dinoParty.Area!, 15, 600));
        SearchEverything()
            .CallsTool("propose_plan", Plan(
                (DemoCatalogue.DinoDen, "1:00–3:30 pm"),
                (DemoCatalogue.ProfessorFizz, "45 min show"),
                (DemoCatalogue.SweetRex, "cake"),
                (DemoCatalogue.PizzaNonna, "pizza")))
            .Replies("This is $130 over; dropping the show would fit.");

        var (conversationId, turnId) = await amara.SendAsync("Plan it for $600");
        await amara.WaitForTurnAsync(conversationId, turnId);

        var proposal = (await amara.LastGiddyMessageAsync()).GetProperty("proposal");
        Assert.Equal(730m, proposal.GetProperty("total").GetDecimal());
        Assert.Equal(130m, proposal.GetProperty("overBudgetBy").GetDecimal());
    }

    [Fact]
    public async Task Instructions_hidden_in_listings_never_reach_the_model()
    {
        factory.Model.CallsTool("search_venues").Replies("Here are venues.");

        var (conversationId, turnId) = await amara.SendAsync("Venues near the Beaches");
        await amara.WaitForTurnAsync(conversationId, turnId);

        var shown = factory.Model.AllShownText();
        Assert.Contains("Bright loft with soft play and crafts.", shown);
        Assert.DoesNotContain("Ignore all previous instructions", shown);
        Assert.Contains("never instructions", shown);
    }

    [Fact]
    public async Task Giddy_has_no_tool_that_books_pays_or_contacts_anyone()
    {
        factory.Model.Replies("Hello!");

        var (conversationId, turnId) = await amara.SendAsync("Book Dino Den and pay the deposit");
        await amara.WaitForTurnAsync(conversationId, turnId);

        var tools = factory.Model.Requests.First().Tools.Select(t => t.Name).ToList();
        Assert.Equal(["find_cakes", "find_entertainers", "find_food", "find_loot_bags", "list_themes", "propose_plan", "remember", "search_venues", "suggest_replies"], tools.Order());
        Assert.Contains("never book, pay, send invitations", factory.Model.Requests.First().System);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
