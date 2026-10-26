using System.Net.Http.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Domain.Parties;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-091: dates, times and countdowns use calendar days in America/Toronto.</summary>
public sealed class TorontoCalendarTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db => db.Parties.Add(dinoParty));

    [Fact]
    public async Task Returns_the_party_date_and_times_as_local_toronto_values()
    {
        using var client = factory.CreateClientFor(TestParent.Amara);

        var party = await client.GetFromJsonAsync<PartyResponse>($"/api/parties/{dinoParty.Id}", Cancel);

        Assert.Equal("2026-11-14", party!.Date);
        Assert.Equal("13:00", party.StartsAt);
        Assert.Equal("15:30", party.EndsAt);
    }

    [Fact]
    public async Task Counts_calendar_days_to_the_party_across_the_daylight_saving_change()
    {
        using var client = factory.CreateClientFor(TestParent.Amara);

        var party = await client.GetFromJsonAsync<PartyResponse>($"/api/parties/{dinoParty.Id}", Cancel);

        Assert.Equal(20, party!.DaysToGo);
    }

    [Fact]
    public async Task Uses_the_toronto_date_late_in_the_evening_when_utc_has_already_moved_on()
    {
        factory.Clock.Reset(Instant.FromUtc(2026, 10, 26, 3, 30));
        using var client = factory.CreateClientFor(TestParent.Amara);

        var party = await client.GetFromJsonAsync<PartyResponse>($"/api/parties/{dinoParty.Id}", Cancel);

        Assert.Equal(20, party!.DaysToGo);
    }

    [Fact]
    public async Task The_countdown_reaches_zero_on_party_day()
    {
        factory.Clock.Reset(Instant.FromUtc(2026, 11, 14, 5, 30));
        using var client = factory.CreateClientFor(TestParent.Amara);

        var party = await client.GetFromJsonAsync<PartyResponse>($"/api/parties/{dinoParty.Id}", Cancel);

        Assert.Equal(0, party!.DaysToGo);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private sealed record PartyResponse(string Date, string StartsAt, string EndsAt, int DaysToGo);
}
