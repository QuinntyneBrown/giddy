using System.Net;
using System.Net.Http.Json;
using Giddy.Api.IntegrationTests.Support;
using Xunit;

namespace Giddy.Api.IntegrationTests;

public sealed class SessionTests : IDisposable
{
    private readonly GiddyApiFactory factory = new();

    [Fact]
    public async Task Health_check_is_anonymous_but_api_routes_require_authentication()
    {
        using var client = factory.CreateClient();

        var health = await client.GetAsync("/health", TestContext.Current.CancellationToken);
        var session = await client.GetAsync("/api/session", TestContext.Current.CancellationToken);
        var parties = await client.GetAsync("/api/parties", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, health.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, session.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, parties.StatusCode);
    }

    [Fact]
    public async Task Signed_in_parent_gets_their_session()
    {
        using var client = factory.CreateClientFor(TestParent.Amara);

        var session = await client.GetFromJsonAsync<SessionResponse>("/api/session", TestContext.Current.CancellationToken);

        Assert.Equal(new SessionResponse(TestParent.Amara.Id, "Amara Okafor", "amara.okafor@example.com", true), session);
    }

    public void Dispose() => factory.Dispose();

    private sealed record SessionResponse(Guid ParentId, string Name, string Email, bool EmailVerified);
}
