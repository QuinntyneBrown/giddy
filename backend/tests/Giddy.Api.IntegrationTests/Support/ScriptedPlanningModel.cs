using System.Collections.Concurrent;
using System.Text.Json;
using Giddy.Application.Agent.Model;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>
/// Stands in for Claude. Each scripted step answers one model request, in order, and every
/// request is recorded so tests can check what the model was shown.
/// </summary>
public sealed class ScriptedPlanningModel : IPlanningModel
{
    private readonly ConcurrentQueue<Func<ModelRequest, CancellationToken, Task<ModelResponse>>> script = new();
    private int toolCallCount;

    public ConcurrentBag<ModelRequest> Requests { get; } = [];

    public ScriptedPlanningModel CallsTool(string name, object? input = null) => CallsTools((name, input));

    public ScriptedPlanningModel CallsTools(params (string Name, object? Input)[] calls)
    {
        script.Enqueue((_, _) => Task.FromResult(new ModelResponse(
            calls.Select(c => (ModelContent)new ToolUseContent(
                $"toolu_{Interlocked.Increment(ref toolCallCount)}",
                c.Name,
                JsonSerializer.SerializeToElement(c.Input ?? new { }))).ToList(),
            ModelStopReason.ToolUse)));
        return this;
    }

    public ScriptedPlanningModel Replies(string text)
    {
        script.Enqueue((_, _) => Task.FromResult(new ModelResponse([new TextContent(text)], ModelStopReason.EndTurn)));
        return this;
    }

    public ScriptedPlanningModel IsUnavailable()
    {
        script.Enqueue((_, _) => throw new ModelUnavailableException("overloaded"));
        return this;
    }

    /// <summary>Thinks until the turn is cancelled.</summary>
    public ScriptedPlanningModel Hangs()
    {
        script.Enqueue(async (_, cancel) =>
        {
            await Task.Delay(Timeout.Infinite, cancel);
            throw new InvalidOperationException("unreachable");
        });
        return this;
    }

    public Task<ModelResponse> NextAsync(ModelRequest request, CancellationToken cancellationToken)
    {
        Requests.Add(request);
        return script.TryDequeue(out var step)
            ? step(request, cancellationToken)
            : Task.FromResult(new ModelResponse([new TextContent("(no scripted reply)")], ModelStopReason.EndTurn));
    }

    /// <summary>Everything the model was shown, including tool results, as one string.</summary>
    public string AllShownText() => string.Join("\n", Requests.SelectMany(r => r.Messages).SelectMany(m => m.Content).Select(c => c switch
    {
        TextContent t => t.Text,
        ToolResultContent r => r.Content,
        _ => string.Empty,
    }));
}
