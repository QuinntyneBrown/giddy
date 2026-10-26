using Giddy.Application.Agent;
using Giddy.Domain.Conversations;
using Giddy.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Giddy.Infrastructure.Agent;

/// <summary>Runs queued turns, several at once, each with its own scope and a cancellation the parent controls.</summary>
public sealed class AgentTurnWorker(
    IAgentTurnQueue queue,
    IServiceScopeFactory scopes,
    TurnCancellations cancellations,
    ILogger<AgentTurnWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var request in queue.DequeueAllAsync(stoppingToken))
        {
            _ = Task.Run(() => RunAsync(request, stoppingToken), CancellationToken.None);
        }
    }

    private async Task RunAsync(TurnRequest request, CancellationToken stoppingToken)
    {
        var token = cancellations.Register(request.TurnId, stoppingToken);
        try
        {
            using var scope = scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<GiddyDbContext>();
            if (!await db.AgentTurns.AnyAsync(t => t.Id == request.TurnId && t.Status == TurnStatus.Running, CancellationToken.None))
            {
                return;
            }

            await scope.ServiceProvider.GetRequiredService<AgentLoop>().RunAsync(request.TurnId, request.ParentName, token);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Agent turn {TurnId} crashed", request.TurnId);
            await FailAsync(request.TurnId);
        }
        finally
        {
            cancellations.Release(request.TurnId);
        }
    }

    private async Task FailAsync(Guid turnId)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<GiddyDbContext>();
        var turn = await db.AgentTurns.SingleOrDefaultAsync(t => t.Id == turnId);
        if (turn is { Status: TurnStatus.Running })
        {
            turn.Fail(AgentLoop.UnavailableMessage);
            await db.SaveChangesAsync();
        }
    }
}
