using System.Net;
using System.Net.Http.Json;
using Giddy.Api.IntegrationTests.Support;
using Giddy.Application.Notifications;
using Giddy.Domain.Notifications;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-058 and L2-061: channels per category, texts that can be stopped, and unsubscribing.</summary>
public sealed class DeliveryTests : IAsyncLifetime
{
    private static readonly DateTimeZone Toronto = DateTimeZoneProviders.Tzdb["America/Toronto"];
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db =>
    {
        var amara = Accounts.Amara(db);
        amara.UpdateProfile("Amara", "Okafor", "416-555-0131");
        amara.SetChannels(NotificationCategory.Reminders, email: false, text: true, push: false);
    });

    [Fact]
    public async Task Only_the_chosen_channels_are_used_for_a_category()
    {
        At(2026, 11, 3, 10, 0);

        await QueueAsync(NotificationCategory.Reminders, "Order the cake is due tomorrow");
        await QueueAsync(NotificationCategory.Rsvps, "Lily Chen replied");

        Assert.Equal(["Lily Chen replied"], factory.Email.Sent.Select(m => m.Subject));
        var text = Assert.Single(factory.Sms.Sent);
        Assert.Equal("416-555-0131", text.To);
        Assert.StartsWith("Giddy: Order the cake is due tomorrow", text.Body);
        Assert.EndsWith("Reply STOP to opt out", text.Body);
    }

    [Fact]
    public async Task Stop_turns_texts_off_for_that_number()
    {
        using var provider = factory.CreateClient();
        provider.DefaultRequestHeaders.Add("X-Giddy-Webhook-Secret", GiddyApiFactory.SmsEventsSecret);
        At(2026, 11, 3, 10, 0);

        var stop = await provider.PostAsJsonAsync("/api/sms-events", new { from = "+14165550131", text = "STOP" }, Cancel);
        await QueueAsync(NotificationCategory.Reminders, "Order the cake is due tomorrow");

        Assert.Equal(HttpStatusCode.NoContent, stop.StatusCode);
        Assert.Empty(factory.Sms.Sent);
    }

    [Fact]
    public async Task The_sms_webhook_needs_its_secret()
    {
        using var stranger = factory.CreateClient();

        var response = await stranger.PostAsJsonAsync("/api/sms-events", new { from = "+14165550131", text = "STOP" }, Cancel);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task With_quiet_hours_off_texts_go_at_night()
    {
        await factory.SeedAsync(db => db.Parents.Find(TestParent.Amara.Id)!.SetQuietHours(false));
        At(2026, 11, 3, 23, 30);

        await QueueAsync(NotificationCategory.Reminders, "Order the cake is due tomorrow");

        Assert.Single(factory.Sms.Sent);
    }

    [Fact]
    public async Task One_click_unsubscribes_from_party_ideas_without_signing_in()
    {
        await factory.SeedAsync(db => db.Parents.Find(TestParent.Amara.Id)!.SetChannels(NotificationCategory.Ideas, email: true, text: false, push: false));
        string link;
        using (var scope = factory.Services.CreateScope())
        {
            link = scope.ServiceProvider.GetRequiredService<Unsubscribe>().LinkFor(TestParent.Amara.Id);
        }

        using var visitor = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
        var response = await visitor.PostAsync(new Uri(link).PathAndQuery, null, Cancel);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var parent = await factory.QueryAsync(db => Task.FromResult(db.Parents.Single(p => p.Id == TestParent.Amara.Id)));
        Assert.False(parent.Channels(NotificationCategory.Ideas).Email);
        Assert.False(parent.MarketingOptIn);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private void At(int year, int month, int day, int hour, int minute) =>
        factory.Clock.Reset(new LocalDateTime(year, month, day, hour, minute).InZoneLeniently(Toronto).ToInstant());

    private async Task QueueAsync(NotificationCategory category, string subject)
    {
        using var scope = factory.Services.CreateScope();
        var outbox = scope.ServiceProvider.GetRequiredService<NotificationOutbox>();
        await outbox.QueueAsync(TestParent.Amara.Id, category, subject, "Body", "/", null, $"test:{Guid.NewGuid()}", Cancel);
        await outbox.DispatchDueAsync(Cancel);
    }
}
