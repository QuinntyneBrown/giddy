using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace Giddy.Api.Authentication;

/// <summary>Google and Apple through ASP.NET Core's handlers, landing in a short-lived external cookie.</summary>
public sealed class ProviderSignIn(IAuthenticationSchemeProvider schemes) : IExternalSignIn
{
    public const string ExternalScheme = "External";

    private static readonly Dictionary<string, string> Schemes = new()
    {
        ["google"] = "Google",
        ["apple"] = "Apple",
    };

    public bool IsAvailable(string provider) =>
        Schemes.TryGetValue(provider, out var scheme) && schemes.GetSchemeAsync(scheme).GetAwaiter().GetResult() is not null;

    public Task ChallengeAsync(HttpContext context, string provider, string callbackUrl) =>
        context.ChallengeAsync(Schemes[provider], new AuthenticationProperties { RedirectUri = callbackUrl });

    public async Task<ExternalIdentity?> ReadAsync(HttpContext context)
    {
        var result = await context.AuthenticateAsync(ExternalScheme);
        if (!result.Succeeded || result.Principal.FindFirstValue(ClaimTypes.Email) is not { } email)
        {
            return null;
        }

        var provider = Schemes.FirstOrDefault(s => s.Value == result.Ticket.AuthenticationScheme || s.Value == result.Properties?.Items[".AuthScheme"]).Key ?? "google";
        // Google and Apple only release addresses they have verified.
        return new ExternalIdentity(provider, email, result.Principal.FindFirstValue(ClaimTypes.GivenName) ?? result.Principal.FindFirstValue(ClaimTypes.Name) ?? string.Empty, EmailVerified: true);
    }

    public Task ForgetAsync(HttpContext context) => context.SignOutAsync(ExternalScheme);
}
