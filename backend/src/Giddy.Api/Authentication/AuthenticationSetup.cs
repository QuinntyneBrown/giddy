using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;

namespace Giddy.Api.Authentication;

public static class AuthenticationSetup
{
    public const string CookieName = "__Host-giddy-session";

    /// <summary>
    /// Session cookie: HttpOnly, Secure and SameSite=Lax. Every endpoint requires a signed-in parent
    /// unless it opts into anonymous access. API calls get 401/403, never a redirect.
    /// </summary>
    public static IServiceCollection AddGiddyAuthentication(this IServiceCollection services)
    {
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
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
        return services;
    }
}
