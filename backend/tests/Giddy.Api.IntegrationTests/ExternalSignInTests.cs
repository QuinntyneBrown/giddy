using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.Authentication;
using Giddy.Api.IntegrationTests.Support;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-002: continuing with Google or Apple.</summary>
public sealed class ExternalSignInTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db => Accounts.Amara(db));

    [Fact]
    public async Task A_new_provider_account_is_created_verified_and_goes_to_family_setup()
    {
        factory.External.Next = new ExternalIdentity("google", "kofi.mensah@example.com", "Kofi", EmailVerified: true);
        using var browser = await factory.CreateAnonymousClientAsync();

        var landed = await FollowAsync(browser, "/api/auth/external/google?returnUrl=/parties");

        Assert.Equal("/welcome", landed);
        var session = await browser.Http.GetFromJsonAsync<JsonElement>("/api/session", Cancel);
        Assert.Equal(("Kofi", true), (session.GetProperty("name").GetString(), session.GetProperty("emailVerified").GetBoolean()));
    }

    [Fact]
    public async Task An_existing_account_with_the_same_verified_email_is_signed_in()
    {
        factory.External.Next = new ExternalIdentity("apple", TestParent.Amara.Email.ToUpperInvariant(), "Amara O.", EmailVerified: true);
        using var browser = await factory.CreateAnonymousClientAsync();

        var landed = await FollowAsync(browser, "/api/auth/external/apple?returnUrl=/parties");

        Assert.Equal("/parties", landed);
        Assert.Equal(1, await factory.QueryAsync(db => Task.FromResult(db.Parents.Count())));
    }

    [Fact]
    public async Task A_cancelled_or_failed_provider_sign_in_creates_nothing()
    {
        factory.External.Next = null;
        using var browser = await factory.CreateAnonymousClientAsync();

        var landed = await FollowAsync(browser, "/api/auth/external/google");

        Assert.Equal("/sign-in?error=provider", landed);
        Assert.Equal(1, await factory.QueryAsync(db => Task.FromResult(db.Parents.Count())));
        Assert.Equal(HttpStatusCode.Unauthorized, (await browser.Http.GetAsync("/api/session", Cancel)).StatusCode);
    }

    [Fact]
    public async Task Only_local_return_addresses_are_followed()
    {
        factory.External.Next = new ExternalIdentity("google", TestParent.Amara.Email, "Amara", EmailVerified: true);
        using var browser = await factory.CreateAnonymousClientAsync();

        var landed = await FollowAsync(browser, "/api/auth/external/google?returnUrl=https://evil.example.com");

        Assert.Equal("/", landed);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    /// <summary>Follows the API's redirects and returns where the web app is sent.</summary>
    private async Task<string> FollowAsync(AccountClient browser, string url)
    {
        var response = await browser.Http.GetAsync(url, Cancel);
        while (response.StatusCode == HttpStatusCode.Redirect && response.Headers.Location!.OriginalString.StartsWith("/api/", StringComparison.Ordinal))
        {
            response = await browser.Http.GetAsync(response.Headers.Location, Cancel);
        }

        Assert.Equal(HttpStatusCode.Redirect, response.StatusCode);
        return response.Headers.Location!.OriginalString;
    }
}
