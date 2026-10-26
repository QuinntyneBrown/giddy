using Giddy.Api.IntegrationTests.Support;
using Giddy.Application.Checklist.Reminders;
using Giddy.Application.Notifications;
using Giddy.Domain.Parties;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-049 and L2-061: task reminders the day before, the overdue digest, and quiet hours.</summary>
public sealed class TaskReminderTests : IAsyncLifetime
{
    private static readonly DateTimeZone Toronto = DateTimeZoneProviders.Tzdb["America/Toronto"];
    private readonly GiddyApiFactory factory = new();
    private readonly Party dinoParty = TestData.DinoParty().WithPlan(doneTasks: 3, confirmedBookings: 1);
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        TestData.AddPeople(db);
        db.Parties.Add(dinoParty);
    });

    [Fact]
    public async Task The_owner_is_reminded_at_nine_the_day_before_a_task_is_due_and_only_once()
    {
        await factory.SeedAsync(db =>
        {
            var party = db.Parties.Find(dinoParty.Id)!;
            var cake = party.Checklist.Single(t => t.Title == "Order the cake");
            party.SaveTask(cake with { OwnerId = TestParent.Kemi.Id, RemindMe = true });
        });
        At(2026, 11, 3, 9, 0);

        await RunAsync();
        await RunAsync();

        var reminders = factory.Email.Sent.Where(m => m.Subject.Contains("due tomorrow")).ToList();
        var reminder = Assert.Single(reminders, m => m.Subject == "Order the cake is due tomorrow");
        Assert.Equal(TestParent.Kemi.Email, reminder.To);
        Assert.Contains("Zuri’s Dino Dig 7th", reminder.Body);
        Assert.DoesNotContain(reminders, m => m.Subject.StartsWith("Order loot bags") && m.To == TestParent.Kemi.Email);
    }

    [Fact]
    public async Task Nothing_is_sent_before_nine_or_for_tasks_without_a_reminder()
    {
        await factory.SeedAsync(db =>
        {
            var party = db.Parties.Find(dinoParty.Id)!;
            var loot = party.Checklist.Single(t => t.Title == "Order loot bags");
            party.SaveTask(loot with { RemindMe = false });
        });
        At(2026, 11, 3, 8, 30);

        await RunAsync();

        Assert.Empty(factory.Email.Sent);
        At(2026, 11, 3, 9, 1);
        await RunAsync();
        Assert.DoesNotContain(factory.Email.Sent, m => m.Subject == "Order loot bags is due tomorrow");
    }

    [Fact]
    public async Task One_morning_digest_lists_every_overdue_task_for_the_party()
    {
        At(2026, 11, 8, 9, 0);

        await RunAsync();
        await RunAsync();

        var digest = Assert.Single(factory.Email.Sent, m => m.Subject.Contains("overdue"));
        Assert.Equal(("4 tasks are overdue for Zuri’s Dino Dig 7th", TestParent.Amara.Email), (digest.Subject, digest.To));
        Assert.Contains("Order the cake", digest.Body);
        Assert.Contains("Order loot bags", digest.Body);
        Assert.Contains("Share the allergy list with the venue", digest.Body);
        Assert.Contains("Send an RSVP reminder", digest.Body);
    }

    [Fact]
    public async Task A_reminder_due_in_quiet_hours_waits_until_seven()
    {
        using (var scope = factory.Services.CreateScope())
        {
            At(2026, 11, 3, 22, 30);
            await scope.ServiceProvider.GetRequiredService<NotificationOutbox>().QueueAsync(
                TestParent.Amara.Id, Giddy.Domain.Notifications.NotificationCategory.Reminders, "Order the cake is due tomorrow", "Body", "/", urgentOn: null, $"test:{Guid.NewGuid()}", Cancel);
        }

        await DispatchAsync();
        Assert.Empty(factory.Email.Sent);
        At(2026, 11, 4, 6, 59);
        await DispatchAsync();
        Assert.Empty(factory.Email.Sent);
        At(2026, 11, 4, 7, 0);
        await DispatchAsync();

        Assert.Single(factory.Email.Sent);
    }

    [Fact]
    public async Task An_urgent_message_on_the_party_day_is_sent_straight_away_in_quiet_hours()
    {
        At(2026, 11, 14, 6, 15);
        using (var scope = factory.Services.CreateScope())
        {
            await scope.ServiceProvider.GetRequiredService<NotificationOutbox>().QueueAsync(
                TestParent.Amara.Id, Giddy.Domain.Notifications.NotificationCategory.Vendors, "Professor Fizz cancelled", "Body", "/", urgentOn: dinoParty.Date, $"test:{Guid.NewGuid()}", Cancel);
        }

        await DispatchAsync();

        Assert.Single(factory.Email.Sent);
    }

    [Fact]
    public async Task An_urgent_message_before_the_party_day_still_waits()
    {
        At(2026, 11, 13, 23, 0);
        using (var scope = factory.Services.CreateScope())
        {
            await scope.ServiceProvider.GetRequiredService<NotificationOutbox>().QueueAsync(
                TestParent.Amara.Id, Giddy.Domain.Notifications.NotificationCategory.Vendors, "Professor Fizz cancelled", "Body", "/", urgentOn: dinoParty.Date, $"test:{Guid.NewGuid()}", Cancel);
        }

        await DispatchAsync();

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
        await scope.ServiceProvider.GetRequiredService<TaskReminders>().RunAsync(Cancel);
        await scope.ServiceProvider.GetRequiredService<NotificationOutbox>().DispatchDueAsync(Cancel);
    }

    private async Task DispatchAsync()
    {
        using var scope = factory.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<NotificationOutbox>().DispatchDueAsync(Cancel);
    }
}
