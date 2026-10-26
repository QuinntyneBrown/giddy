using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Giddy.Api.IntegrationTests.Support;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-005: resetting a forgotten password.</summary>
public sealed partial class PasswordResetTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db => Accounts.Amara(db));

    [Fact]
    public async Task Any_email_gets_the_same_answer_and_only_an_account_gets_a_link()
    {
        using var browser = await factory.CreateAnonymousClientAsync();

        var known = await browser.PostAsync("/api/auth/password/forgot", new { email = TestParent.Amara.Email });
        var unknown = await browser.PostAsync("/api/auth/password/forgot", new { email = "nobody@example.com" });

        Assert.Equal((HttpStatusCode.Accepted, HttpStatusCode.Accepted), (known.StatusCode, unknown.StatusCode));
        var email = Assert.Single(factory.Email.Sent);
        Assert.Equal((TestParent.Amara.Email, "Reset your Giddy password"), (email.To, email.Subject));
        Assert.Contains("30 minutes", email.Body);
    }

    [Fact]
    public async Task A_new_password_signs_the_parent_in_here_and_out_everywhere_else()
    {
        using var other = await factory.CreateAnonymousClientAsync();
        await other.PostAsync("/api/auth/sign-in", new { email = TestParent.Amara.Email, password = Accounts.Password, keepSignedIn = true });
        using var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/password/forgot", new { email = TestParent.Amara.Email });
        var token = Token(factory.Email.Sent.Single(m => m.Subject == "Reset your Giddy password").Body);

        var check = await browser.Http.GetFromJsonAsync<JsonElement>($"/api/auth/password/reset/{token}", Cancel);
        var reset = await browser.PostAsync("/api/auth/password/reset", new { token, password = "volcano-lab-77", confirm = "volcano-lab-77" });

        Assert.Equal(TestParent.Amara.Email, check.GetProperty("email").GetString());
        Assert.Equal(HttpStatusCode.OK, reset.StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await browser.Http.GetAsync("/api/session", Cancel)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await other.Http.GetAsync("/api/session", Cancel)).StatusCode);
        using var fresh = await factory.CreateAnonymousClientAsync();
        Assert.Equal(HttpStatusCode.OK, (await fresh.PostAsync("/api/auth/sign-in", new { email = TestParent.Amara.Email, password = "volcano-lab-77", keepSignedIn = false })).StatusCode);
    }

    [Fact]
    public async Task Mismatched_or_weak_passwords_change_nothing()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/password/forgot", new { email = TestParent.Amara.Email });
        var token = Token(factory.Email.Sent.Single().Body);

        var response = await browser.PostAsync("/api/auth/password/reset", new { token, password = "short", confirm = "different" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("errors");
        Assert.Equal("Use at least 10 characters, a number or a symbol", errors.GetProperty("password")[0].GetString());
        Assert.Equal("Passwords don’t match", errors.GetProperty("confirm")[0].GetString());
    }

    [Fact]
    public async Task A_link_older_than_thirty_minutes_or_used_has_expired()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/password/forgot", new { email = TestParent.Amara.Email });
        var token = Token(factory.Email.Sent.Single().Body);

        factory.Clock.Advance(Duration.FromMinutes(31));
        var check = await browser.Http.GetAsync($"/api/auth/password/reset/{token}", Cancel);
        var reset = await browser.Http.PostAsJsonAsync("/api/auth/password/reset", new { token, password = "volcano-lab-77", confirm = "volcano-lab-77" }, Cancel);

        Assert.Equal((HttpStatusCode.Gone, HttpStatusCode.Gone), (check.StatusCode, reset.StatusCode));
    }

    [Fact]
    public async Task A_reset_lifts_a_sign_in_pause()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        for (var i = 0; i < 6; i++)
        {
            await browser.PostAsync("/api/auth/sign-in", new { email = TestParent.Amara.Email, password = "not-my-password-1", keepSignedIn = false });
        }

        await browser.PostAsync("/api/auth/password/forgot", new { email = TestParent.Amara.Email });
        await browser.PostAsync("/api/auth/password/reset", new { token = Token(factory.Email.Sent.Single().Body), password = "volcano-lab-77", confirm = "volcano-lab-77" });
        using var fresh = await factory.CreateAnonymousClientAsync();

        Assert.Equal(HttpStatusCode.OK, (await fresh.PostAsync("/api/auth/sign-in", new { email = TestParent.Amara.Email, password = "volcano-lab-77", keepSignedIn = false })).StatusCode);
    }

    [Fact]
    public async Task An_email_outage_says_the_link_was_not_sent()
    {
        factory.Email.Failing = true;
        using var browser = await factory.CreateAnonymousClientAsync();

        var response = await browser.Http.PostAsJsonAsync("/api/auth/password/forgot", new { email = TestParent.Amara.Email }, Cancel);

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        Assert.Equal("We couldn’t send the email just now", (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("title").GetString());
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private static string Token(string body) => ResetLink().Match(body).Groups[1].Value;

    [GeneratedRegex(@"reset-password\?token=([A-Za-z0-9_-]+)")]
    private static partial Regex ResetLink();
}
