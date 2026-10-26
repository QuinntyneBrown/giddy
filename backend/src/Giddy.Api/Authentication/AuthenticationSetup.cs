using Giddy.Application.Accounts.Sessions;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;

namespace Giddy.Api.Authentication;

public static class AuthenticationSetup
{
    public const string CookieName = "__Host-giddy-session";

    /// <summary>
    /// Session cookie: HttpOnly, Secure and SameSite=Lax, naming a server-side session that is
    /// checked on every request, so signing out and password changes end it. Every endpoint requires
    /// a signed-in parent unless it opts into anonymous access. API calls get 401/403, never a
    /// redirect. Google and Apple are offered only when their client ids are configured.
    /// </summary>
    public static IServiceCollection AddGiddyAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var authentication = services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme);
        authentication.AddCookie(ProviderSignIn.ExternalScheme, options =>
        {
            options.Cookie.Name = "__Host-giddy-external";
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Lax;
            options.ExpireTimeSpan = TimeSpan.FromMinutes(5);
        });
        if (configuration["Authentication:Google:ClientId"] is { Length: > 0 } googleId)
        {
            authentication.AddGoogle("Google", options =>
            {
                options.ClientId = googleId;
                options.ClientSecret = configuration["Authentication:Google:ClientSecret"]!;
                options.SignInScheme = ProviderSignIn.ExternalScheme;
            });
        }

        if (configuration["Authentication:Apple:ClientId"] is { Length: > 0 } appleId)
        {
            authentication.AddOpenIdConnect("Apple", options =>
            {
                options.Authority = "https://appleid.apple.com";
                options.ClientId = appleId;
                // Apple's client secret is a short-lived signed JWT, rotated outside the app.
                options.ClientSecret = configuration["Authentication:Apple:ClientSecret"];
                options.ResponseType = "code";
                options.ResponseMode = "form_post";
                options.CallbackPath = "/api/auth/external/apple-callback";
                options.Scope.Add("email");
                options.Scope.Add("name");
                options.SignInScheme = ProviderSignIn.ExternalScheme;
            });
        }

        authentication.AddCookie(options =>
            {
                options.Cookie.Name = CookieName;
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.SlidingExpiration = true;
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    return Task.CompletedTask;
                };
                options.Events.OnValidatePrincipal = async context =>
                {
                    var sessionId = context.Principal?.FindFirst(SessionCookie.SessionClaim)?.Value;
                    var sessions = context.HttpContext.RequestServices.GetRequiredService<ParentSessions>();
                    var parent = Guid.TryParse(sessionId, out var id) ? await sessions.ValidateAsync(id, context.HttpContext.RequestAborted) : null;
                    if (parent is null)
                    {
                        context.RejectPrincipal();
                        return;
                    }

                    // Keeps the name and verified flag current, for example after confirming the email.
                    context.ReplacePrincipal(SessionCookie.Principal(parent.Id, parent.Name, parent.Email, parent.EmailVerified, id));
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    return Task.CompletedTask;
                };
            });
        services.AddAuthorizationBuilder()
            .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());
        services.AddHttpContextAccessor();
        services.AddScoped<Giddy.Application.Common.ICurrentParent, CurrentParent>();
        services.AddHttpClient<Giddy.Application.Accounts.IBreachedPasswords, PwnedPasswords>();
        services.AddSingleton<IExternalSignIn, ProviderSignIn>();
        return services;
    }
}
