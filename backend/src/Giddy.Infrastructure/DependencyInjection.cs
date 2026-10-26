using Giddy.Application;
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
        return services;
    }
}
