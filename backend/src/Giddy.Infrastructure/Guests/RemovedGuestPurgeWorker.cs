using Giddy.Application.Guests;
using Giddy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NodaTime;

namespace Giddy.Infrastructure.Guests;

/// <summary>Deletes removed guests once their Undo window has passed, every minute.</summary>
public sealed class RemovedGuestPurgeWorker(IServiceScopeFactory scopes, IClock clock, ILogger<RemovedGuestPurgeWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = scopes.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<GiddyDbContext>();
                var cutoff = clock.GetCurrentInstant() - RemovedGuests.UndoWindow;
                var expired = await db.Guests.IgnoreQueryFilters().Where(g => g.RemovedAt != null && g.RemovedAt < cutoff).ToListAsync(stoppingToken);
                db.Guests.RemoveRange(expired);
                await db.SaveChangesAsync(stoppingToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                logger.LogError(exception, "Purging removed guests failed");
            }
        }
    }
}
