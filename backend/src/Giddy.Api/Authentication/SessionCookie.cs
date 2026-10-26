using System.Security.Claims;
using Giddy.Application.Accounts;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace Giddy.Api.Authentication;

/// <summary>Issues the session cookie for a server-side session. A new cookie at every sign-in rotates it.</summary>
public static class SessionCookie
{
    public const string SessionClaim = "sid";

    public static Task SignInAsync(HttpContext context, SignedIn signedIn) =>
        context.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            Principal(signedIn.ParentId, signedIn.Name, signedIn.Email, signedIn.EmailVerified, signedIn.SessionId),
            new AuthenticationProperties
            {
                IsPersistent = signedIn.Persistent,
                ExpiresUtc = signedIn.Persistent ? DateTimeOffset.UtcNow.AddDays(30) : null,
                AllowRefresh = true,
            });

    public static ClaimsPrincipal Principal(Guid parentId, string name, string email, bool emailVerified, Guid sessionId) =>
        new(new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, parentId.ToString()),
                new Claim(ClaimTypes.Name, name),
                new Claim(ClaimTypes.Email, email),
                new Claim("email_verified", emailVerified ? "true" : "false"),
                new Claim(SessionClaim, sessionId.ToString()),
            ],
            CookieAuthenticationDefaults.AuthenticationScheme));
}
