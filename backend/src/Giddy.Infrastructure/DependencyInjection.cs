using Anthropic;
using Giddy.Application;
using Giddy.Application.Agent;
using Giddy.Application.Agent.Model;
using Giddy.Infrastructure.Agent;
using Giddy.Infrastructure.Bookings;
using Giddy.Application.Bookings;
using Giddy.Application.Common;
using Giddy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NodaTime;

namespace Giddy.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddApplication();
        services.AddDbContext<GiddyDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("Giddy")
                ?? throw new InvalidOperationException("Set the ConnectionStrings__Giddy configuration value.")));
        services.AddScoped<IGiddyDbContext>(provider => provider.GetRequiredService<GiddyDbContext>());
        services.AddSingleton<IClock>(SystemClock.Instance);
        services.AddSingleton<Giddy.Application.Venues.IVenueAvailability, CatalogueVenueAvailability>();
        services.AddSingleton<IVenuePartner, CatalogueVenuePartner>();
        services.AddSingleton<IPaymentGateway, SandboxPaymentGateway>();
        services.AddSingleton<IEmailSender, LoggingEmailSender>();
        services.AddSingleton<ISmsSender, LoggingSmsSender>();
        services.AddSingleton<IWebLinks, ConfiguredWebLinks>();
        services.AddHostedService<Guests.RemovedGuestPurgeWorker>();
        return services;
    }

    /// <summary>Giddy's planning agent: Claude, the turn queue and the background workers.</summary>
    public static IServiceCollection AddPlanningAgent(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<ClaudeOptions>().Bind(configuration.GetSection("Claude"));
        // Two 4 s connection attempts mean an unreachable provider is reported within 10 seconds (L2-020).
        services.AddSingleton(_ => new AnthropicClient
        {
            MaxRetries = 1,
            HttpClient = new HttpClient(new SocketsHttpHandler { ConnectTimeout = TimeSpan.FromSeconds(4) })
            {
                Timeout = Timeout.InfiniteTimeSpan,
            },
        });
        services.AddSingleton<IPlanningModel, ClaudePlanningModel>();
        services.AddSingleton<IAgentTurnQueue, ChannelAgentTurnQueue>();
        services.AddHostedService<AgentTurnWorker>();
        services.AddHostedService<TurnLogRetentionWorker>();
        return services;
    }
}
