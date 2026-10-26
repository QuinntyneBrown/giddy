using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Disruptions;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-029 and L2-030: booking status banners and the booking on the venue page.</summary>
public sealed class BookingStatusTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.Add(dinoParty);
        db.CatalogueItems.AddRange(DemoCatalogue.Items());
    });

    [Fact]
    public async Task A_party_with_nothing_booked_has_no_booking_notices()
    {
        using var amara = factory.CreateClientFor(TestParent.Amara);

        var notices = await amara.GetFromJsonAsync<JsonElement>(NoticesUrl, Cancel);

        Assert.Equal(0, notices.GetArrayLength());
    }

    [Fact]
    public async Task A_held_slot_shows_when_the_hold_expires_and_offers_to_book()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await BookAsync(amara, "tok_3ds");

        var notice = Assert.Single((await amara.GetFromJsonAsync<JsonElement>(NoticesUrl, Cancel)).EnumerateArray());

        Assert.Equal("hold", notice.GetProperty("kind").GetString());
        Assert.Equal("info", notice.GetProperty("tone").GetString());
        Assert.Equal("Dino Den Play Café is holding 1:00 pm for you", notice.GetProperty("title").GetString());
        Assert.Equal("The hold lasts until Tue 27 Oct, 4:00 pm. Pay the $100 deposit to lock it in.", notice.GetProperty("text").GetString());
        Assert.Equal(DemoCatalogue.DinoDen, notice.GetProperty("venueId").GetGuid());
        Assert.True(notice.GetProperty("dismissible").GetBoolean());
    }

    [Fact]
    public async Task An_expired_hold_is_no_longer_shown()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await BookAsync(amara, "tok_3ds");
        factory.Clock.Advance(Duration.FromHours(49));

        var notices = await amara.GetFromJsonAsync<JsonElement>(NoticesUrl, Cancel);

        Assert.Equal(0, notices.GetArrayLength());
    }

    [Fact]
    public async Task A_confirmed_booking_shows_its_confirmation_number()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await BookAsync(amara, "tok_visa");

        var notice = Assert.Single((await amara.GetFromJsonAsync<JsonElement>(NoticesUrl, Cancel)).EnumerateArray());

        Assert.Equal("confirmed", notice.GetProperty("kind").GetString());
        Assert.Equal("success", notice.GetProperty("tone").GetString());
        Assert.Equal("Dino Den Play Café confirmed your booking", notice.GetProperty("title").GetString());
        Assert.Equal("Sat 14 Nov, 1:00–3:30 pm · confirmation DD-48213.", notice.GetProperty("text").GetString());
    }

    [Fact]
    public async Task A_declined_deposit_shows_a_persistent_banner_offering_another_card()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await BookAsync(amara, "tok_declined");

        var notice = Assert.Single((await amara.GetFromJsonAsync<JsonElement>(NoticesUrl, Cancel)).EnumerateArray());

        Assert.Equal("declined", notice.GetProperty("kind").GetString());
        Assert.Equal("danger", notice.GetProperty("tone").GetString());
        Assert.Equal("Your deposit payment didn’t go through", notice.GetProperty("title").GetString());
        Assert.Equal("Visa ending 0002 was declined, so Dino Den Play Café released the hold. The 1:00 pm slot is still free right now.", notice.GetProperty("text").GetString());
        Assert.False(notice.GetProperty("dismissible").GetBoolean());
    }

    [Fact]
    public async Task A_known_disruption_near_the_venue_on_the_party_day_shows_a_warning_that_cannot_be_dismissed()
    {
        await factory.SeedAsync(db =>
        {
            db.Disruptions.Add(new DisruptionNotice(
                Guid.NewGuid(), "Sat 14 Nov is a TTC weekend closure on Queen St E", "The 501 streetcar is replaced by buses. Leave extra time.",
                43.6680, -79.3300, 3, new LocalDate(2026, 11, 14), new LocalDate(2026, 11, 15)));
            db.Disruptions.Add(new DisruptionNotice(
                Guid.NewGuid(), "Lakeshore closure in Mississauga", "Far away.", 43.5890, -79.6441, 3, new LocalDate(2026, 11, 14), new LocalDate(2026, 11, 14)));
            db.Disruptions.Add(new DisruptionNotice(
                Guid.NewGuid(), "Queen St E water main work", "The week before.", 43.6680, -79.3300, 3, new LocalDate(2026, 11, 2), new LocalDate(2026, 11, 6)));
        });
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await BookAsync(amara, "tok_visa");

        var notices = (await amara.GetFromJsonAsync<JsonElement>(NoticesUrl, Cancel)).EnumerateArray().ToList();

        var disruption = Assert.Single(notices, n => n.GetProperty("kind").GetString() == "disruption");
        Assert.Equal("warning", disruption.GetProperty("tone").GetString());
        Assert.Equal("Sat 14 Nov is a TTC weekend closure on Queen St E", disruption.GetProperty("title").GetString());
        Assert.False(disruption.GetProperty("dismissible").GetBoolean());
    }

    [Fact]
    public async Task Viewers_see_the_notices_and_strangers_cannot()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        await BookAsync(amara, "tok_visa");
        using var dev = factory.CreateClientFor(TestParent.Dev);
        using var stranger = factory.CreateClientFor(TestParent.Stranger);

        var viewer = await dev.GetFromJsonAsync<JsonElement>(NoticesUrl, Cancel);
        var outsider = await stranger.GetAsync(NoticesUrl, Cancel);

        Assert.Equal(1, viewer.GetArrayLength());
        Assert.Equal(HttpStatusCode.NotFound, outsider.StatusCode);
    }

    [Fact]
    public async Task The_venue_page_shows_the_partys_booking_and_the_deposit_terms()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var url = $"/api/venues/{DemoCatalogue.DinoDen}?date=2026-11-14&partyId={dinoParty.Id}";
        var before = await amara.GetFromJsonAsync<JsonElement>(url, Cancel);
        await BookAsync(amara, "tok_visa");

        var after = await amara.GetFromJsonAsync<JsonElement>(url, Cancel);

        Assert.Equal(JsonValueKind.Null, before.GetProperty("booking").ValueKind);
        Assert.Equal(100m, before.GetProperty("deposit").GetDecimal());
        Assert.Equal("2026-10-31", before.GetProperty("freeCancellationUntil").GetString());
        var booking = after.GetProperty("booking");
        Assert.Equal("DD-48213", booking.GetProperty("confirmationNumber").GetString());
        Assert.Equal("Bea at 416-555-0142", booking.GetProperty("contact").GetString());
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private string NoticesUrl => $"/api/parties/{dinoParty.Id}/booking-notices";

    private async Task BookAsync(HttpClient client, string token) =>
        await client.PostAsJsonAsync($"/api/parties/{dinoParty.Id}/bookings", new
        {
            venueId = DemoCatalogue.DinoDen,
            date = "2026-11-14",
            start = "13:00",
            bookingName = "Amara Okafor",
            mobile = "416-555-0188",
            child = "Zuri, turning 7",
            payment = new { token },
        }, Cancel);
}
