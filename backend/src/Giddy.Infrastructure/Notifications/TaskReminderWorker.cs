using Giddy.Application.Checklist.Reminders;
using Giddy.Application.Notifications;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Giddy.Infrastructure.Notifications;

/// <summary>Every minute: queues the day's task reminders and digests, then sends what is due.</summary>
public sealed class TaskReminderWorker(IServiceScopeFactory scopes, ILogger<TaskReminderWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = scopes.CreateScope();
                await scope.ServiceProvider.GetRequiredService<TaskReminders>().RunAsync(stoppingToken);
                await scope.ServiceProvider.GetRequiredService<NotificationOutbox>().DispatchDueAsync(stoppingToken);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                logger.LogError(exception, "Sending task reminders failed");
            }
        }
    }
}
