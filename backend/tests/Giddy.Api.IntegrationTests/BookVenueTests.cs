using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-028 and L2-029: book a venue slot and pay the deposit.</summary>
public sealed class BookVenueTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.Add(dinoParty);
        db.Parties.Add(TestData.StrangersParty());
        db.CatalogueItems.AddRange(DemoCatalogue.Items());
    });

    [Fact]
    public async Task Booking_a_free_slot_holds_it_takes_the_deposit_and_confirms_it()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(BookingsUrl, Booking(), Cancel);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var booking = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("confirmed", booking.GetProperty("state").GetString());
        Assert.Equal("DD-48213", booking.GetProperty("confirmationNumber").GetString());
        Assert.Equal("Dino Den Play Café", booking.GetProperty("venueName").GetString());
        Assert.Equal(("13:00", "15:30"), (booking.GetProperty("start").GetString(), booking.GetProperty("end").GetString()));
        Assert.Equal("Fossil Room", booking.GetProperty("room").GetString());
        Assert.Equal(100m, booking.GetProperty("deposit").GetDecimal());
        Assert.Equal(240m, booking.GetProperty("balance").GetDecimal());
        Assert.Equal(("Visa", "4242"), (booking.GetProperty("card").GetProperty("brand").GetString(), booking.GetProperty("card").GetProperty("last4").GetString()));
        Assert.Equal("2026-10-31", booking.GetProperty("freeCancellationUntil").GetString());

        var authorised = Assert.Single(factory.Payments.Authorised);
        Assert.Equal(100m, authorised.Amount);
        Assert.Single(factory.Payments.Captured);
        Assert.Empty(factory.Payments.Voided);
        var contact = Assert.Single(factory.Partner.Confirmed);
        Assert.Equal(("Amara Okafor", "416-555-0188"), (contact.Name, contact.Mobile));
        Assert.Contains("Peanut", contact.Notes);
    }

    [Fact]
    public async Task A_confirmed_booking_updates_the_plan_and_emails_the_confirmation()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        (await amara.PostAsJsonAsync(BookingsUrl, Booking(), Cancel)).EnsureSuccessStatusCode();

        var bookings = await amara.GetFromJsonAsync<JsonElement>($"/api/parties/{dinoParty.Id}/bookings", Cancel);
        var venue = bookings.EnumerateArray().Single(b => b.GetProperty("category").GetString() == "Venue");
        Assert.Equal("confirmed", venue.GetProperty("status").GetString());
        Assert.Equal(100m, venue.GetProperty("paid").GetDecimal());

        var party = await factory.QueryAsync(db => db.Parties.SingleAsync(p => p.Id == dinoParty.Id, Cancel));
        Assert.Contains(party.Checklist, t => t.Title == "Share the allergy list");

        var email = Assert.Single(factory.Email.Sent);
        Assert.Equal(TestParent.Amara.Email, email.To);
        Assert.Contains("DD-48213", email.Subject + email.Body);

        var slots = await amara.GetFromJsonAsync<JsonElement>($"/api/venues/{DemoCatalogue.DinoDen}?date=2026-11-14&partyId={dinoParty.Id}", Cancel);
        Assert.True(slots.GetProperty("slots").EnumerateArray().Single(s => s.GetProperty("start").GetString() == "13:00").GetProperty("booked").GetBoolean());
    }

    [Theory]
    [InlineData("")]
    [InlineData("555-01")]
    public async Task A_missing_or_invalid_mobile_number_is_rejected_before_anything_is_attempted(string mobile)
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(BookingsUrl, Booking(mobile: mobile), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.True(problem.GetProperty("errors").TryGetProperty("mobile", out _));
        Assert.Empty(factory.Payments.Authorised);
        Assert.Empty(factory.Partner.Confirmed);
    }

    [Fact]
    public async Task Only_planners_can_book_and_strangers_cannot_see_the_party()
    {
        using var dev = await factory.CreateBrowserClientFor(TestParent.Dev);
        using var stranger = await factory.CreateBrowserClientFor(TestParent.Stranger);

        var viewer = await dev.PostAsJsonAsync(BookingsUrl, Booking(), Cancel);
        var outsider = await stranger.PostAsJsonAsync(BookingsUrl, Booking(), Cancel);

        Assert.Equal(HttpStatusCode.Forbidden, viewer.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, outsider.StatusCode);
        Assert.Empty(factory.Payments.Authorised);
    }

    [Fact]
    public async Task A_co_planner_can_book()
    {
        using var kemi = await factory.CreateBrowserClientFor(TestParent.Kemi);

        var response = await kemi.PostAsJsonAsync(BookingsUrl, Booking(), Cancel);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal(TestParent.Kemi.Email, Assert.Single(factory.Email.Sent).To);
    }

    [Fact]
    public async Task A_slot_taken_while_the_dialog_was_open_offers_alternatives_and_takes_no_payment()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        factory.Partner.TakeSlot(DemoCatalogue.DinoDen, new NodaTime.LocalDate(2026, 11, 14), new NodaTime.LocalTime(13, 0));

        var response = await amara.PostAsJsonAsync(BookingsUrl, Booking(), Cancel);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Contains("no longer free", problem.GetProperty("title").GetString());
        var alternative = Assert.Single(problem.GetProperty("alternatives").EnumerateArray());
        Assert.Equal(("16:00", "18:30"), (alternative.GetProperty("start").GetString(), alternative.GetProperty("end").GetString()));
        Assert.Empty(factory.Payments.Authorised);
    }

    [Fact]
    public async Task A_slot_that_is_already_booked_cannot_be_booked()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(BookingsUrl, Booking(start: "10:00"), Cancel);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Empty(factory.Payments.Authorised);
    }

    [Fact]
    public async Task When_the_venue_does_not_confirm_the_payment_is_cancelled_and_the_hold_released()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        factory.Partner.ConfirmTimesOut = true;

        var response = await amara.PostAsJsonAsync(BookingsUrl, Booking(), Cancel);

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Contains("nothing was charged", problem.GetProperty("title").GetString());
        Assert.Single(factory.Payments.Voided);
        Assert.Empty(factory.Payments.Captured);
        Assert.Single(factory.Partner.Released);
        var party = await factory.QueryAsync(db => db.Parties.SingleAsync(p => p.Id == dinoParty.Id, Cancel));
        Assert.Equal(BookingStatus.ToBook, party.BookingsToDo.Single(b => b.Category == "Venue").Status);
        Assert.Empty(factory.Email.Sent);
    }

    [Fact]
    public async Task A_declined_card_releases_the_hold_and_charges_nothing()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync(BookingsUrl, Booking(token: "tok_declined"), Cancel);

        Assert.Equal(HttpStatusCode.PaymentRequired, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("Visa ending 0002 was declined, so nothing was charged. Try another card.", problem.GetProperty("title").GetString());
        Assert.Single(factory.Partner.Released);
        Assert.Empty(factory.Payments.Captured);
        Assert.Empty(factory.Partner.Confirmed);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private string BookingsUrl => $"/api/parties/{dinoParty.Id}/bookings";

    private static object Booking(string mobile = "416-555-0188", string start = "13:00", string token = "tok_visa") => new
    {
        venueId = DemoCatalogue.DinoDen,
        date = "2026-11-14",
        start,
        bookingName = "Amara Okafor",
        mobile,
        child = "Zuri, turning 7",
        notes = "Peanut allergy in the group. We’ll bring our own nut-free cake.",
        payment = new { token },
    };
}
