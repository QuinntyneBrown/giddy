using System.Text.Json;
using Giddy.Application.Agent.Model;
using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Conversations;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Agent;

/// <summary>
/// Runs one turn: asks the model, runs the tools it requests (recording each as a visible step),
/// and repeats until it replies or eight tool rounds have passed.
/// </summary>
public sealed class AgentLoop(
    IGiddyDbContext db,
    IPlanningModel model,
    IEnumerable<IAgentTool> tools,
    TorontoCalendar calendar,
    IClock clock,
    TurnLogger log)
{
    public const int MaxToolRounds = 8;
    public const string UnavailableMessage = "Giddy can’t answer right now. Your message is saved; try again in a minute.";

    private readonly Dictionary<string, IAgentTool> toolsByName = tools.ToDictionary(t => t.Definition.Name);

    public async Task RunAsync(Guid turnId, string parentName, CancellationToken cancellationToken)
    {
        var turn = await db.AgentTurns.SingleAsync(t => t.Id == turnId, CancellationToken.None);
        var conversation = await db.Conversations.SingleAsync(c => c.Id == turn.ConversationId, CancellationToken.None);
        var party = conversation.PartyId is { } partyId
            ? await db.Parties.SingleOrDefaultAsync(p => p.Id == partyId, CancellationToken.None)
            : null;
        var memories = await db.Memories.Where(m => m.FamilyId == conversation.ParentId).OrderBy(m => m.RememberedAt).ToListAsync(CancellationToken.None);
        var context = new AgentTurnContext(turnId, conversation, party, conversation.ParentId, calendar.Today, clock.GetCurrentInstant());

        try
        {
            var reply = await ConverseAsync(context, TurnTranscript.Build(conversation, party, memories, calendar.Today, parentName), turn, cancellationToken);
            var message = ChatMessage.FromGiddy(Guid.NewGuid(), reply, clock.GetCurrentInstant(), context.Steps, context.Suggestions, context.Proposal?.Id);
            if (context.Proposal is not null) db.Proposals.Add(context.Proposal);
            conversation.AddGiddyMessage(message);
            log.Write(context, "reply", reply);
            turn.Complete(message.Id);
        }
        catch (OperationCanceledException)
        {
            if (context.Steps.Count > 0)
            {
                conversation.AddGiddyMessage(ChatMessage.FromGiddy(
                    Guid.NewGuid(), "You stopped Giddy.", clock.GetCurrentInstant(), context.Steps.Where(s => s.Done), [], null));
            }

            turn.Cancel();
        }
        catch (Exception exception) when (exception is ModelUnavailableException or HttpRequestException or TimeoutException)
        {
            log.Write(context, "error", exception.GetType().Name);
            turn.Fail(UnavailableMessage);
        }

        await db.SaveChangesAsync(CancellationToken.None);
    }

    private async Task<string> ConverseAsync(AgentTurnContext context, string transcript, AgentTurn turn, CancellationToken cancellationToken)
    {
        var definitions = toolsByName.Values.Select(t => t.Definition).ToList();
        var messages = new List<ModelMessage> { new(ModelRole.User, [new TextContent(transcript)]) };
        log.Write(context, "prompt", transcript);

        for (var round = 0; round <= MaxToolRounds; round++)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var response = await model.NextAsync(new ModelRequest(SystemPrompt.Text, messages, definitions), cancellationToken);
            messages.Add(new ModelMessage(ModelRole.Assistant, response.Content));

            if (response.StopReason == ModelStopReason.Refusal)
            {
                return "I can only help with planning kids’ parties. What would you like to plan?";
            }

            var calls = response.Content.OfType<ToolUseContent>().ToList();
            if (calls.Count == 0 || round == MaxToolRounds)
            {
                var text = string.Join("\n\n", response.Content.OfType<TextContent>().Select(t => t.Text.Trim()).Where(t => t.Length > 0));
                return text.Length > 0 ? text : "I couldn’t finish that plan. Could you tell me a little more?";
            }

            var results = new List<ModelContent>();
            foreach (var call in calls)
            {
                results.Add(await RunToolAsync(call, context, turn, cancellationToken));
            }

            messages.Add(new ModelMessage(ModelRole.User, results));
        }

        return "I couldn’t finish that plan.";
    }

    private async Task<ToolResultContent> RunToolAsync(ToolUseContent call, AgentTurnContext context, AgentTurn turn, CancellationToken cancellationToken)
    {
        log.Write(context, "tool_call", $"{call.Name} {call.Input.GetRawText()}");
        if (!toolsByName.TryGetValue(call.Name, out var tool))
        {
            return new ToolResultContent(call.Id, $"There is no tool called {call.Name}.", IsError: true);
        }

        var stepId = call.Id;
        var started = tool.DescribeStart(call.Input, context);
        if (started is not null)
        {
            turn.Record(TurnEventTypes.StepStarted, stepId, started);
            await db.SaveChangesAsync(CancellationToken.None);
        }

        ToolOutcome outcome;
        try
        {
            outcome = await tool.RunAsync(call.Input, context, cancellationToken);
        }
        catch (JsonException)
        {
            outcome = new ToolOutcome("The tool input was not valid.", null, IsError: true);
        }

        log.Write(context, "tool_result", outcome.Result);
        if (started is not null)
        {
            var done = outcome.DoneText ?? started.TrimEnd('…');
            context.Steps.Add(new ToolStep(done, Done: true));
            turn.Record(TurnEventTypes.StepDone, stepId, done);
            await db.SaveChangesAsync(CancellationToken.None);
        }

        return new ToolResultContent(call.Id, outcome.Result, outcome.IsError);
    }
}
