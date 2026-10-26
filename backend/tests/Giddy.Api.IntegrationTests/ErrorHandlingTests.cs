using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-087, L2-088 and L2-071: consistent problem responses and security headers.</summary>
public sealed class ErrorHandlingTests : IDisposable
{
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    [Fact]
    public async Task An_unexpected_failure_returns_a_problem_with_a_reference_code_and_no_internals()
    {
        using var failing = factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.RemoveAll<IClock>();
            services.AddSingleton<IClock, BrokenClock>();
        }));
        await new GiddyApiFactorySeeder(failing.Services).SeedDinoPartyAsync();
        using var client = failing.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.Header, TestParent.Amara.HeaderValue);

        var response = await client.GetAsync("/api/parties", Cancel);
        var body = await response.Content.ReadAsStringAsync(Cancel);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = JsonDocument.Parse(body).RootElement;
        Assert.Matches("^GDY-[0-9A-Z]{4}$", problem.GetProperty("referenceCode").GetString());
        Assert.DoesNotContain("BrokenClock", body);
        Assert.DoesNotContain("   at ", body);
    }

    [Fact]
    public async Task An_unknown_api_route_returns_not_found()
    {
        using var client = factory.CreateClientFor(TestParent.Amara);

        var response = await client.GetAsync("/api/does-not-exist", Cancel);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Responses_carry_the_security_headers()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health", Cancel);

        var csp = string.Join(";", response.Headers.GetValues("Content-Security-Policy"));
        Assert.Contains("default-src 'self'", csp);
        Assert.DoesNotContain("unsafe-inline", csp);
        Assert.Equal("nosniff", response.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.Equal("strict-origin-when-cross-origin", response.Headers.GetValues("Referrer-Policy").Single());
        Assert.StartsWith("max-age=", response.Headers.GetValues("Strict-Transport-Security").Single());
    }

    public void Dispose() => factory.Dispose();

    private sealed class BrokenClock : IClock
    {
        public Instant GetCurrentInstant() => throw new InvalidOperationException("BrokenClock exploded");
    }
}
