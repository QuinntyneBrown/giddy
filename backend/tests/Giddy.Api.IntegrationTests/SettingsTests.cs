using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Giddy.Api.IntegrationTests.Support;
using Xunit;

namespace Giddy.Api.IntegrationTests;

/// <summary>L2-065: the profile, a new email, quiet hours and notification channels.</summary>
public sealed partial class SettingsTests : IAsyncLifetime
{
    private readonly GiddyApiFactory factory = new();
    private CancellationToken Cancel => TestContext.Current.CancellationToken;

    public async ValueTask InitializeAsync() => await factory.SeedAsync(db => Accounts.Amara(db));

    [Fact]
    public async Task The_profile_is_saved()
    {
        using var browser = await SignedInAsync();

        var saved = await browser.Http.PutAsJsonAsync("/api/settings/profile", new { firstName = "Amara", lastName = "Okafor", mobile = "416-555-0131", postalCode = "m4l 2a1" }, Cancel);
        var settings = await browser.Http.GetFromJsonAsync<JsonElement>("/api/settings", Cancel);

        Assert.Equal(HttpStatusCode.OK, saved.StatusCode);
        Assert.Equal(("Okafor", "416-555-0131", "M4L 2A1"), (settings.GetProperty("lastName").GetString(), settings.GetProperty("mobile").GetString(), settings.GetProperty("postalCode").GetString()));
    }

    [Fact]
    public async Task An_incomplete_mobile_or_postal_code_saves_nothing()
    {
        using var browser = await SignedInAsync();

        var response = await browser.Http.PutAsJsonAsync("/api/settings/profile", new { firstName = "Amara", lastName = "", mobile = "416-555", postalCode = "12345" }, Cancel);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var errors = (await response.Content.ReadFromJsonAsync<JsonElement>(Cancel)).GetProperty("errors");
        Assert.Equal("Enter a Canadian mobile number, like 416-555-0131, or leave it blank", errors.GetProperty("mobile")[0].GetString());
        Assert.Equal("Enter a Canadian postal code, like M4M 1H1", errors.GetProperty("postalCode")[0].GetString());
    }

    [Fact]
    public async Task A_new_email_replaces_the_old_one_only_once_it_is_confirmed_and_the_old_one_is_told()
    {
        using var browser = await SignedInAsync();

        var asked = await browser.Http.PostAsJsonAsync("/api/settings/email", new { email = "amara.new@example.com" }, Cancel);
        var before = await browser.Http.GetFromJsonAsync<JsonElement>("/api/settings", Cancel);
        var link = factory.Email.Sent.Single(m => m.To == "amara.new@example.com");
        var notice = factory.Email.Sent.Single(m => m.To == TestParent.Amara.Email);
        await browser.PostAsync("/api/auth/verify", new { token = Token().Match(link.Body).Groups[1].Value });
        var after = await browser.Http.GetFromJsonAsync<JsonElement>("/api/settings", Cancel);

        Assert.Equal(HttpStatusCode.Accepted, asked.StatusCode);
        Assert.Equal((TestParent.Amara.Email, "amara.new@example.com"), (before.GetProperty("email").GetString(), before.GetProperty("pendingEmail").GetString()));
        Assert.Equal("Your Giddy email is changing", notice.Subject);
        Assert.Equal("amara.new@example.com", after.GetProperty("email").GetString());
        Assert.Equal(JsonValueKind.Null, after.GetProperty("pendingEmail").ValueKind);
    }

    [Fact]
    public async Task Quiet_hours_and_channels_are_saved_straight_away()
    {
        using var browser = await SignedInAsync();

        await browser.Http.PutAsJsonAsync("/api/settings/quiet-hours", new { on = false }, Cancel);
        await browser.Http.PutAsJsonAsync("/api/settings/notifications", new
        {
            rsvps = new { email = true, text = true, push = false },
            vendors = new { email = true, text = false, push = false },
            reminders = new { email = false, text = true, push = false },
            ideas = new { email = true, text = false, push = false },
        }, Cancel);
        var settings = await browser.Http.GetFromJsonAsync<JsonElement>("/api/settings", Cancel);

        Assert.False(settings.GetProperty("quietHours").GetBoolean());
        var channels = settings.GetProperty("notifications");
        Assert.Equal((false, true), (channels.GetProperty("reminders").GetProperty("email").GetBoolean(), channels.GetProperty("reminders").GetProperty("text").GetBoolean()));
        Assert.True(channels.GetProperty("ideas").GetProperty("email").GetBoolean());
    }

    public ValueTask DisposeAsync()
    {
        factory.Dispose();
        return ValueTask.CompletedTask;
    }

    private async Task<AccountClient> SignedInAsync()
    {
        var browser = await factory.CreateAnonymousClientAsync();
        await browser.PostAsync("/api/auth/sign-in", new { email = TestParent.Amara.Email, password = Accounts.Password, keepSignedIn = false });
        return browser;
    }

    [GeneratedRegex(@"verify-email\?token=([A-Za-z0-9_-]+)")]
    private static partial Regex Token();
}
