using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>Signs a request in as the parent named in the X-Test-Parent header.</summary>
public sealed class TestAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string Scheme = "Test";
    public const string Header = "X-Test-Parent";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(Header, out var value))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var parts = value.ToString().Split('|');
        var identity = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, parts[0]),
                new Claim(ClaimTypes.Name, parts[1]),
                new Claim(ClaimTypes.Email, parts[2]),
                new Claim("email_verified", parts.Length > 3 && parts[3] == "unverified" ? "false" : "true"),
            ],
            Scheme);

        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme)));
    }
}
