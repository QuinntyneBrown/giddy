using System.Net;
using System.Net.Http.Json;
using Giddy.Api.IntegrationTests.Support;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-059: saving a browser's push subscription after the parent turns notifications on.</summary>
public sealed class PushSubscriptionTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(TestData.AddPeople);

    [Fact]
    public async Task A_subscription_is_saved_once_and_removed()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);
        var subscription = new { endpoint = "https://push.example.com/abc", p256dh = "BKey", auth = "secret" };

        var first = await amara.PostAsJsonAsync("/api/push-subscriptions", subscription, Cancel);
        var again = await amara.PostAsJsonAsync("/api/push-subscriptions", subscription, Cancel);
        var count = await factory.QueryAsync(db => Task.FromResult(db.PushSubscriptions.Count()));
        var removed = await amara.SendAsync(new HttpRequestMessage(HttpMethod.Delete, "/api/push-subscriptions") { Content = JsonContent.Create(new { endpoint = subscription.endpoint }) }, Cancel);

        Assert.Equal((HttpStatusCode.NoContent, HttpStatusCode.NoContent, 1), (first.StatusCode, again.StatusCode, count));
        Assert.Equal(HttpStatusCode.NoContent, removed.StatusCode);
        Assert.Equal(0, await factory.QueryAsync(db => Task.FromResult(db.PushSubscriptions.Count())));
    }

    [Fact]
    public async Task Only_https_push_services_are_accepted()
    {
        using var amara = await factory.CreateBrowserClientFor(TestParent.Amara);

        var response = await amara.PostAsJsonAsync("/api/push-subscriptions", new { endpoint = "http://evil.example.com", p256dh = "k", auth = "a" }, Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }
}
