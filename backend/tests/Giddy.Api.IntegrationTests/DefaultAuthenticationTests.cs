using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Giddy.Api.IntegrationTests;

public sealed class DefaultAuthenticationTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Health_check_is_anonymous_but_api_routes_require_authentication()
    {
        using var client = factory.CreateClient();

        var healthResponse = await client.GetAsync("/health", TestContext.Current.CancellationToken);
        var protectedResponse = await client.GetAsync("/api/parties", TestContext.Current.CancellationToken);

        Assert.Equal(System.Net.HttpStatusCode.OK, healthResponse.StatusCode);
        Assert.Equal(System.Net.HttpStatusCode.Unauthorized, protectedResponse.StatusCode);
    }

    [Fact]
    public async Task Health_check_includes_security_headers()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health", TestContext.Current.CancellationToken);

        Assert.True(response.Headers.Contains("X-Content-Type-Options"));
        Assert.True(response.Headers.Contains("Referrer-Policy"));
    }
}
