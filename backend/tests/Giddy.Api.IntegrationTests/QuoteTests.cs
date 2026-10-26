using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-034 and L2-031: request quotes, receive them, and hear before they expire.</summary>
public sealed class QuoteTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan(confirmedBookings: 1);
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.Add(dinoParty);
        db.CatalogueItems.AddRange(DemoCatalogue.Items());
    });

    [Fact]
    public async Task A_quote_request_reaches_the_vendor_and_appears_in_the_plan()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(QuotesUrl, Request(), Cancel);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var quote = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal(("Rexy the Dino Visit", "requested"), (quote.GetProperty("vendorName").GetString(), quote.GetProperty("status").GetString()));
        Assert.Equal("Rexy the Dino Visit usually replies within a day.", quote.GetProperty("replyTime").GetString());
        var (vendor, details) = Assert.Single(factory.Vendors.Requests);
        Assert.Equal(("Rexy the Dino Visit", "14:15", 16), (vendor, details.Start, details.Kids));
        Assert.Contains("Zuri", details.Message);
        var party = await factory.QueryAsync(db => db.Parties.SingleAsync(p => p.Id == dinoParty.Id, Cancel));
        var todo = party.BookingsToDo.Single(b => b.Name == "Rexy the Dino Visit");
        Assert.Equal(("Entertainer", BookingStatus.QuoteRequested, 150m), (todo.Category, todo.Status, todo.Estimate));
    }

    [Fact]
    public async Task The_start_time_must_fall_within_the_venue_booking()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(QuotesUrl, Request(start: "16:00"), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Choose a start time between 1:00 and 3:30 pm, while you have the venue.", problem.GetProperty("errors").GetProperty("start")[0].GetString());
        Assert.Empty(factory.Vendors.Requests);
    }

    [Fact]
    public async Task One_request_per_vendor_is_pending_at_a_time_for_a_day()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        (await amara.PostAsJsonAsync(QuotesUrl, Request(), Cancel)).EnsureSuccessStatusCode();

        var again = await amara.PostAsJsonAsync(QuotesUrl, Request(), Cancel);
        factory.Clock.Advance(Duration.FromHours(25));
        var tomorrow = await amara.PostAsJsonAsync(QuotesUrl, Request(), Cancel);

        Assert.Equal(HttpStatusCode.Conflict, again.StatusCode);
        Assert.Equal(
            "You asked Rexy the Dino Visit for a quote less than a day ago, so a request is pending.",
            (await again.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("title").GetString());
        Assert.Equal(HttpStatusCode.Created, tomorrow.StatusCode);
    }

    [Fact]
    public async Task A_vendors_quote_is_recorded_in_the_budget_and_the_parent_is_told()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var cursor = (await amara.GetFromJsonAsync<JsonElement>("/api/live-updates", Cancel)).GetProperty("cursor").GetInt64();
        var request = await (await amara.PostAsJsonAsync(QuotesUrl, Request(), Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);

        var reply = await ReplyAsync(request.GetProperty("id").GetGuid(), 165m, "2026-11-04", FactorySecret);

        Assert.Equal(HttpStatusCode.Accepted, reply.StatusCode);
        var bookings = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/bookings", Cancel);
        var rexy = bookings.EnumerateArray().Single(b => b.GetProperty("name").GetString() == "Rexy the Dino Visit");
        Assert.Equal(("quoted", 165m, "2026-11-04"), (rexy.GetProperty("status").GetString(), rexy.GetProperty("price").GetDecimal(), rexy.GetProperty("quoteExpiresOn").GetString()));
        var update = Assert.Single((await amara.GetFromJsonAsync<JsonElement>($"/api/live-updates?after={cursor}", Cancel)).GetProperty("events").EnumerateArray());
        Assert.Equal(("quote", "Rexy the Dino Visit sent a quote"), (update.GetProperty("kind").GetString(), update.GetProperty("title").GetString()));
        Assert.Equal("$165, valid until Wed 4 Nov. It’s in your budget as quoted.", update.GetProperty("text").GetString());
    }

    [Fact]
    public async Task Vendor_replies_without_the_shared_secret_are_refused()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var request = await (await amara.PostAsJsonAsync(QuotesUrl, Request(), Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);

        var reply = await ReplyAsync(request.GetProperty("id").GetGuid(), 1m, "2026-11-04", "wrong");

        Assert.Equal(HttpStatusCode.Unauthorized, reply.StatusCode);
    }

    [Fact]
    public async Task A_quote_expiring_within_two_days_shows_a_warning_that_offers_to_confirm_or_find_another()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var request = await (await amara.PostAsJsonAsync(QuotesUrl, Request(), Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);
        await ReplyAsync(request.GetProperty("id").GetGuid(), 165m, "2026-10-27", FactorySecret);

        var notices = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/booking-notices", Cancel);

        var expiring = Assert.Single(notices.EnumerateArray(), n => n.GetProperty("kind").GetString() == "quote-expiring");
        Assert.Equal(("warning", "Rexy the Dino Visit’s quote expires in 2 days"), (expiring.GetProperty("tone").GetString(), expiring.GetProperty("title").GetString()));
        Assert.Equal("Confirm by Tue 27 Oct to keep it, or find another entertainer.", expiring.GetProperty("text").GetString());
        Assert.Equal(request.GetProperty("id").GetGuid(), expiring.GetProperty("quoteId").GetGuid());
    }

    [Fact]
    public async Task Confirming_a_quote_books_the_vendor_in_the_plan()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var request = await (await amara.PostAsJsonAsync(QuotesUrl, Request(), Cancel)).Content.ReadFromJsonAsync<JsonElement>(Cancel);
        await ReplyAsync(request.GetProperty("id").GetGuid(), 165m, "2026-10-27", FactorySecret);

        var confirmed = await amara.PostAsync($"{QuotesUrl}/{request.GetProperty("id").GetGuid()}/confirm", null, Cancel);

        Assert.Equal(HttpStatusCode.NoContent, confirmed.StatusCode);
        var bookings = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/bookings", Cancel);
        Assert.Equal("confirmed", bookings.EnumerateArray().Single(b => b.GetProperty("name").GetString() == "Rexy the Dino Visit").GetProperty("status").GetString());
        var notices = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/booking-notices", Cancel);
        Assert.DoesNotContain(notices.EnumerateArray(), n => n.GetProperty("kind").GetString() == "quote-expiring");
    }

    [Fact]
    public async Task Viewers_cannot_request_quotes_and_venues_are_not_vendors()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var viewer = await dev.PostAsJsonAsync(QuotesUrl, Request(), Cancel);
        var venue = await amara.PostAsJsonAsync(QuotesUrl, Request(vendorId: DemoCatalogue.DinoDen), Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, viewer.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, venue.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private const string FactorySecret = GiddyApiFactory.VendorQuotesSecret;

    private string QuotesUrl => $"/api/parties/{dinoParty.Id}/quotes";

    private async Task<HttpResponseMessage> ReplyAsync(Guid requestId, decimal amount, string expiresOn, string secret)
    {
        using var vendor = factory.CreateClient();
        using var message = new HttpRequestMessage(HttpMethod.Post, "/api/vendor-quotes")
        {
            Content = JsonContent.Create(new { requestId, amount, expiresOn, note = "Includes a dino dance." }),
        };
        message.Headers.Add("X-Giddy-Webhook-Secret", secret);
        return await vendor.SendAsync(message, Cancel);
    }

    private static object Request(string start = "14:15", Guid? vendorId = null) => new
    {
        vendorId = vendorId ?? DemoCatalogue.RexyDinoVisit,
        date = "2026-11-14",
        start,
        kids = 16,
        location = "Dino Den Play Café, 1124 Queen St E",
        message = "Hi! It’s Zuri’s 7th, a dinosaur party. Could you do a 30-minute visit?",
    };
}
