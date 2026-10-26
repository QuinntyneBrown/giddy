using Giddy.Domain.Conversations;
using Giddy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NodaTime;

namespace Giddy.Infrastructure.Agent;

/// <summary>Deletes turn logs older than 90 days, once a day.</summary>
public sealed class TurnLogRetentionWorker(IServiceScopeFactory scopes, IClock clock, ILogger<TurnLogRetentionWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromDays(1));
        do
        {
            try
            {
                using var scope = scopes.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<GiddyDbContext>();
                var cutoff = clock.GetCurrentInstant() - TurnLogEntry.Retention;
                var expired = await db.TurnLogs.Where(l => l.At < cutoff).ToListAsync(stoppingToken);
                db.TurnLogs.RemoveRange(expired);
                await db.SaveChangesAsync(stoppingToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                logger.LogError(exception, "Could not purge expired turn logs; will retry tomorrow");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
