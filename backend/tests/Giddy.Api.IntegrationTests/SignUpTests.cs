using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Giddy.Api.IntegrationTests.Support;
using NodaTime;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-001 and L2-003: creating an account and confirming the email address.</summary>
public sealed partial class SignUpTests : IDisposable
{
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    [Fact]
    public async Task Signing_up_creates_an_unverified_account_and_sends_a_confirmation_link()
    {
        using var browser = await factory.CreateAnonymousClientAsync();

        var response = await browser.PostAsync("/api/auth/sign-up", SignUp("rania@example.com"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var parent = await factory.QueryAsync(db => Task.FromResult(db.Parents.Single(p => p.Email == "rania@example.com")));
        Assert.Equal(("Rania", false, false), (parent.Name, parent.EmailVerified, parent.MarketingOptIn));
        var family = await factory.QueryAsync(db => Task.FromResult(db.Families.Single(f => f.Id == parent.Id)));
        Assert.Equal("M4M 1H1", family.PostalCode);
        var email = Assert.Single(factory.Email.Sent);
        Assert.Equal(("rania@example.com", "Confirm your email for Giddy"), (email.To, email.Subject));
        Assert.Matches(TokenLink(), email.Body);
        Assert.NotEqual(HttpStatusCode.OK, (await browser.Http.GetAsync("/api/session", Cancel)).StatusCode);
    }

    [Fact]
    public async Task Every_invalid_field_says_how_to_fix_it_and_nothing_is_created()
    {
        using var browser = await factory.CreateAnonymousClientAsync();

        var response = await browser.PostAsync("/api/auth/sign-up", new { firstName = "", email = "rania", password = "short", postalCode = "K1A 0B1", marketing = false });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("errors");
        Assert.Equal("Enter your first name", errors.GetProperty("firstName")[0].GetString());
        Assert.Equal("Enter an email address like name@example.com", errors.GetProperty("email")[0].GetString());
        Assert.Equal("Use at least 10 characters, a number or a symbol", errors.GetProperty("password")[0].GetString());
        Assert.Equal("Enter a postal code in the GTA, like M4M 1H1", errors.GetProperty("postalCode")[0].GetString());
        Assert.Equal(0, await factory.QueryAsync(db => Task.FromResult(db.Parents.Count())));
    }

    [Fact]
    public async Task A_breached_password_is_refused()
    {
        using var browser = await factory.CreateAnonymousClientAsync();

        var response = await browser.PostAsync("/api/auth/sign-up", SignUp("rania@example.com", "password123!"));

        var errors = (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("errors");
        Assert.Equal("Choose a password that hasn’t appeared in a data breach", errors.GetProperty("password")[0].GetString());
    }

    [Fact]
    public async Task An_email_already_registered_gets_the_same_answer_whether_or_not_it_is_verified()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/sign-up", SignUp("rania@example.com"));
        var verified = await SignUpAndVerifyAsync("lily@example.com");

        var unverifiedAgain = await browser.PostAsync("/api/auth/sign-up", SignUp("Rania@Example.com"));
        var verifiedAgain = await browser.PostAsync("/api/auth/sign-up", SignUp("lily@example.com"));

        Assert.Equal((HttpStatusCode.Conflict, HttpStatusCode.Conflict), (unverifiedAgain.StatusCode, verifiedAgain.StatusCode));
        var first = await unverifiedAgain.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        var second = await verifiedAgain.Content.ReadFromJsonAsync<JsonElement>(Cancel);
        Assert.Equal("There’s already a Giddy account for that email", first.GetProperty("title").GetString());
        Assert.Equal(first.GetProperty("title").GetString(), second.GetProperty("title").GetString());
        verified.Dispose();
    }

    [Fact]
    public async Task Opening_the_link_confirms_the_email_and_signs_the_parent_in()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/sign-up", SignUp("rania@example.com"));

        var verified = await browser.PostAsync("/api/auth/verify", new { token = Token(factory.Email.Sent.Single().Body) });

        Assert.Equal(HttpStatusCode.OK, verified.StatusCode);
        var session = await browser.Http.GetFromJsonAsync<JsonElement>("/api/session", Cancel);
        Assert.Equal(("Rania", "rania@example.com", true), (session.GetProperty("name").GetString(), session.GetProperty("email").GetString(), session.GetProperty("emailVerified").GetBoolean()));
    }

    [Fact]
    public async Task A_link_older_than_a_day_or_already_used_has_expired()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/sign-up", SignUp("rania@example.com"));
        await browser.PostAsync("/api/auth/sign-up", SignUp("lily@example.com"));
        var raniaToken = Token(factory.Email.Sent.Single(m => m.To == "rania@example.com").Body);
        var lilyToken = Token(factory.Email.Sent.Single(m => m.To == "lily@example.com").Body);
        await browser.PostAsync("/api/auth/verify", new { token = lilyToken });

        factory.Clock.Advance(Duration.FromHours(25));
        // Lily's browser session has idled out, so the page fetches a fresh token as it would.
        await browser.RefreshAntiforgeryAsync();
        var late = await browser.Http.PostAsJsonAsync("/api/auth/verify", new { token = raniaToken }, Cancel);
        var reused = await browser.Http.PostAsJsonAsync("/api/auth/verify", new { token = lilyToken }, Cancel);

        Assert.Equal((HttpStatusCode.Gone, HttpStatusCode.Gone), (late.StatusCode, reused.StatusCode));
        Assert.Equal("rania@example.com", (await late.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("email").GetString());
    }

    [Fact]
    public async Task A_new_link_waits_a_minute_after_the_last_one()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/sign-up", SignUp("rania@example.com"));

        factory.Clock.Advance(Duration.FromSeconds(20));
        var tooSoon = await browser.Http.PostAsJsonAsync("/api/auth/verify/resend", new { email = "rania@example.com" }, Cancel);
        factory.Clock.Advance(Duration.FromSeconds(41));
        var later = await browser.Http.PostAsJsonAsync("/api/auth/verify/resend", new { email = "rania@example.com" }, Cancel);

        Assert.Equal(HttpStatusCode.TooManyRequests, tooSoon.StatusCode);
        Assert.Equal(40, (await tooSoon.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("retryAfterSeconds").GetInt32());
        Assert.Equal(HttpStatusCode.Accepted, later.StatusCode);
        Assert.Equal(2, factory.Email.Sent.Count(m => m.To == "rania@example.com"));
    }

    [Fact]
    public async Task A_bounced_confirmation_email_shows_on_the_session()
    {
        using var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/sign-up", SignUp("rania@example.com"));
        await browser.PostAsync("/api/auth/verify", new { token = Token(factory.Email.Sent.Single().Body) });
        var parentId = await factory.QueryAsync(db => Task.FromResult(db.Parents.Single().Id));
        using var provider = factory.CreateClient();
        provider.DefaultRequestHeaders.Add("X-Giddy-Webhook-Secret", GiddyApiFactory.EmailEventsSecret);

        await provider.PostAsJsonAsync("/api/email-events", new { type = "bounced", reference = $"parent:{parentId}" }, Cancel);

        var session = await browser.Http.GetFromJsonAsync<JsonElement>("/api/session", Cancel);
        Assert.True(session.GetProperty("emailBounced").GetBoolean());
    }

    public void Dispose() => factory.Dispose();

    private static object SignUp(string email, string password = "dino-dig-2026") =>
        new { firstName = "Rania", email, password, postalCode = "m4m 1h1", marketing = false };

    private static string Token(string body) => TokenLink().Match(body).Groups[1].Value;

    private async Task<AccountClient> SignUpAndVerifyAsync(string email)
    {
        var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/sign-up", SignUp(email));
        await browser.PostAsync("/api/auth/verify", new { token = Token(factory.Email.Sent.Single(m => m.To == email).Body) });
        return browser;
    }

    [GeneratedRegex(@"verify-email\?token=([A-Za-z0-9_-]+)")]
    private static partial Regex TokenLink();
}
