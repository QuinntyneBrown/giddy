using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Giddy.Api.IntegrationTests.Support;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-004, L2-006 and L2-070: signing in and out, sessions, and keeping accounts safe.</summary>
public sealed class SignInTests : IAsyncLifetime
{
    private const string Iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db => Accounts.Amara(db));

    [Fact]
    public async Task The_right_email_and_password_sign_the_parent_in()
    {
        using var browser = await factory.CreateAnonymousClientAsync();

        var response = await browser.PostAsync("/api/auth/sign-in", SignIn(Accounts.Password));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var session = await browser.Http.GetFromJsonAsync<JsonElement>("/api/session", Cancel);
        Assert.Equal(("Amara", true), (session.GetProperty("name").GetString(), session.GetProperty("emailVerified").GetBoolean()));
        var cookie = response.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("__Host-giddy-session", StringComparison.Ordinal));
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("secure", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=lax", cookie, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task A_wrong_password_or_unknown_email_gives_the_same_message()
    {
        using var browser = await factory.CreateAnonymousClientAsync();

        var wrongPassword = await browser.PostAsync("/api/auth/sign-in", SignIn("not-my-password-1"));
        var unknown = await browser.PostAsync("/api/auth/sign-in", new { email = "nobody@example.com", password = Accounts.Password, keepSignedIn = false });

        Assert.Equal((HttpStatusCode.Unauthorized, HttpStatusCode.Unauthorized), (wrongPassword.StatusCode, unknown.StatusCode));
        Assert.Equal("That email and password don’t match", (await wrongPassword.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("title").GetString());
        Assert.Equal("That email and password don’t match", (await unknown.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("title").GetString());
    }

    [Fact]
    public async Task Five_failures_in_fifteen_minutes_pause_sign_in_for_fifteen_minutes()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        for (var i = 0; i < 5; i++)
        {
            await browser.PostAsync("/api/auth/sign-in", SignIn("not-my-password-1"));
        }

        var paused = await browser.PostAsync("/api/auth/sign-in", SignIn(Accounts.Password));
        factory.Clock.Advance(Duration.FromMinutes(16));
        var later = await browser.PostAsync("/api/auth/sign-in", SignIn(Accounts.Password));

        Assert.Equal(HttpStatusCode.Locked, paused.StatusCode);
        Assert.Equal("Sign-in is paused for 15 minutes to keep your account safe", (await paused.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("title").GetString());
        Assert.Equal(HttpStatusCode.OK, later.StatusCode);
    }

    [Fact]
    public async Task Keep_me_signed_in_lasts_thirty_days_and_otherwise_the_browser_session()
    {
        using var kept = await factory.CreateAnonymousClientAsync();
        using var notKept = await factory.CreateAnonymousClientAsync();

        var keep = await kept.PostAsync("/api/auth/sign-in", new { email = TestParent.Amara.Email, password = Accounts.Password, keepSignedIn = true });
        var dontKeep = await notKept.PostAsync("/api/auth/sign-in", SignIn(Accounts.Password));

        var persistent = keep.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("__Host-giddy-session", StringComparison.Ordinal));
        var browserSession = dontKeep.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("__Host-giddy-session", StringComparison.Ordinal));
        Assert.Contains("expires=", persistent, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("expires=", browserSession, StringComparison.OrdinalIgnoreCase);
        factory.Clock.Advance(Duration.FromDays(29));
        Assert.Equal(HttpStatusCode.OK, (await kept.Http.GetAsync("/api/session", Cancel)).StatusCode);
        factory.Clock.Advance(Duration.FromDays(31));
        Assert.Equal(HttpStatusCode.Unauthorized, (await kept.Http.GetAsync("/api/session", Cancel)).StatusCode);
    }

    [Fact]
    public async Task Signing_out_ends_the_session_on_the_server()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        var signedIn = await browser.PostAsync("/api/auth/sign-in", SignIn(Accounts.Password));
        var cookie = signedIn.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("__Host-giddy-session", StringComparison.Ordinal)).Split(';')[0];

        var signedOut = await browser.Http.PostAsync("/api/auth/sign-out", null, Cancel);
        using var replay = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost"), HandleCookies = false });
        replay.DefaultRequestHeaders.Add("Cookie", cookie);

        Assert.Equal(HttpStatusCode.NoContent, signedOut.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await replay.GetAsync("/api/session", Cancel)).StatusCode);
    }

    [Fact]
    public async Task A_sign_in_from_a_new_device_is_emailed_with_the_device_and_place()
    {
        using var laptop = await factory.CreateAnonymousClientAsync();
        using var phone = await factory.CreateAnonymousClientAsync(Iphone);
        await laptop.PostAsync("/api/auth/sign-in", SignIn(Accounts.Password));
        await laptop.Http.PostAsync("/api/auth/sign-out", null, Cancel);
        await laptop.RefreshAntiforgeryAsync();
        await laptop.PostAsync("/api/auth/sign-in", SignIn(Accounts.Password));

        await phone.PostAsync("/api/auth/sign-in", SignIn(Accounts.Password));

        var alert = Assert.Single(factory.Email.Sent);
        Assert.Equal((TestParent.Amara.Email, "New sign-in to Giddy"), (alert.To, alert.Subject));
        Assert.Contains("Safari on iPhone", alert.Body);
        Assert.Contains("Toronto, ON", alert.Body);
        Assert.Contains("/forgot-password", alert.Body);
    }

    [Fact]
    public async Task Sign_in_is_rate_limited_after_ten_requests_a_minute()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        HttpResponseMessage last = null!;
        for (var i = 0; i < 11; i++)
        {
            last = await browser.Http.PostAsJsonAsync("/api/auth/sign-in", new { email = $"someone{i}@example.com", password = "whatever-1", keepSignedIn = false }, Cancel);
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, last.StatusCode);
        Assert.True(last.Headers.RetryAfter is not null);
    }

    [Fact]
    public async Task State_changing_requests_need_the_anti_forgery_token()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        browser.Http.DefaultRequestHeaders.Remove("X-XSRF-TOKEN");

        var response = await browser.Http.PostAsJsonAsync("/api/auth/sign-in", SignIn(Accounts.Password), Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private static object SignIn(string password) => new { email = TestParent.Amara.Email, password, keepSignedIn = false };
}
