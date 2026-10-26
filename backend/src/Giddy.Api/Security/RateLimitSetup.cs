using System.Threading.RateLimiting;

namespace Giddy.Api.Security;

public static class RateLimitSetup
{
    public const string Rsvp = "rsvp";

    /// <summary>Public RSVP links: at most 60 requests a minute from one address.</summary>
    public static IServiceCollection AddGiddyRateLimits(this IServiceCollection services) =>
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy(Rsvp, context => RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions { PermitLimit = 60, Window = TimeSpan.FromMinutes(1) }));
        });
}
