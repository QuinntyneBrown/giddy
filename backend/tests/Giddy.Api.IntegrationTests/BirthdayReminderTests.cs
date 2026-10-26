using Giddy.Api.IntegrationTests.Support;
using Giddy.Application.Families.Reminders;
using Giddy.Application.Notifications;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-008: a nudge to start planning six weeks before a birthday with no plan.</summary>
public sealed class BirthdayReminderTests : IAsyncLifetime
{
    private static readonly DateTimeZone Toronto = DateTimeZoneProviders.Tzdb["America/Toronto"];
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(TestData.AddPeople);

    [Fact]
    public async Task Six_weeks_before_a_birthday_with_no_plan_the_parent_is_nudged_once()
    {
        At(2026, 10, 3, 9, 0);

        await RunAsync();
        await RunAsync();

        var nudge = Assert.Single(factory.Email.Sent);
        Assert.Equal((TestParent.Amara.Email, "Zuri turns 7 in 6 weeks"), (nudge.To, nudge.Subject));
        Assert.Contains("/parties/new", nudge.Body);
    }

    [Fact]
    public async Task No_nudge_when_a_party_is_already_planned_for_that_birthday()
    {
        await factory.SeedAsync(db => db.Parties.Add(TestData.DinoParty()));
        At(2026, 10, 3, 9, 0);

        await RunAsync();

        Assert.Empty(factory.Email.Sent);
    }

    [Fact]
    public async Task No_nudge_on_other_days_or_before_nine()
    {
        At(2026, 10, 3, 8, 0);
        await RunAsync();
        At(2026, 10, 4, 9, 30);
        await RunAsync();

        Assert.Empty(factory.Email.Sent);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private void At(int year, int month, int day, int hour, int minute) =>
        factory.Clock.Reset(new LocalDateTime(year, month, day, hour, minute).InZoneLeniently(Toronto).ToInstant());

    private async Task RunAsync()
    {
        using var scope = factory.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<BirthdayReminders>().RunAsync(Cancel);
        await scope.ServiceProvider.GetRequiredService<NotificationOutbox>().DispatchDueAsync(Cancel);
    }
}
