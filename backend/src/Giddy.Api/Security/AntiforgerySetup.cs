namespace Giddy.Api.Security;

public static class AntiforgerySetup
{
    /// <summary>The cookie Angular reads and echoes back in <see cref="HeaderName"/>.</summary>
    public const string RequestTokenCookie = "XSRF-TOKEN";
    public const string HeaderName = "X-XSRF-TOKEN";

    public static IServiceCollection AddGiddyAntiforgery(this IServiceCollection services)
    {
        services.AddAntiforgery(options =>
        {
            options.HeaderName = HeaderName;
            options.Cookie.Name = "__Host-giddy-antiforgery";
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Strict;
        });
        return services;
    }
}
