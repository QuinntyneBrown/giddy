using Anthropic;
using Anthropic.Exceptions;
using Anthropic.Models.Messages;
using Giddy.Application.Agent.Model;
using Microsoft.Extensions.Options;

namespace Giddy.Infrastructure.Agent;

/// <summary>Giddy's model: the Anthropic Messages API with Giddy's tools.</summary>
public sealed class ClaudePlanningModel(AnthropicClient client, IOptions<ClaudeOptions> options) : IPlanningModel
{
    public async Task<ModelResponse> NextAsync(ModelRequest request, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var parameters = new MessageCreateParams
        {
            Model = settings.Model,
            MaxTokens = settings.MaxTokens,
            System = request.System,
            Tools = request.Tools.Select(ToTool).ToList(),
            Messages = request.Messages.Select(ToMessage).ToList(),
        };

        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(settings.RequestTimeout);
        try
        {
            var message = await client.Messages.Create(parameters, timeout.Token);
            return new ModelResponse(message.Content.Select(FromBlock).OfType<ModelContent>().ToList(), StopReasonOf(message));
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new ModelUnavailableException("The model took too long to answer.");
        }
        catch (AnthropicRateLimitException exception)
        {
            throw new ModelUnavailableException("The model is busy.", exception);
        }
        catch (Anthropic5xxException exception)
        {
            throw new ModelUnavailableException("The model is unavailable.", exception);
        }
        catch (HttpRequestException exception)
        {
            throw new ModelUnavailableException("The model could not be reached.", exception);
        }
    }

    private static ToolUnion ToTool(AgentToolDefinition definition)
    {
        var properties = definition.InputSchema.TryGetProperty("properties", out var props)
            ? props.EnumerateObject().ToDictionary(p => p.Name, p => p.Value.Clone())
            : [];
        var required = definition.InputSchema.TryGetProperty("required", out var req)
            ? req.EnumerateArray().Select(r => r.GetString()!).ToList()
            : [];
        return new Tool
        {
            Name = definition.Name,
            Description = definition.Description,
            InputSchema = new() { Properties = properties, Required = required },
        };
    }

    private static MessageParam ToMessage(ModelMessage message) => message.Role == ModelRole.User
        ? new UserMessageParam { Content = message.Content.Select(ToParam).ToList() }
        : new AssistantMessageParam { Content = message.Content.Select(ToParam).ToList() };

    private static ContentBlockParam ToParam(ModelContent content) => content switch
    {
        TextContent text => new TextBlockParam { Text = text.Text },
        ToolUseContent use => new ToolUseBlockParam { ID = use.Id, Name = use.Name, Input = use.Input.EnumerateObject().ToDictionary(p => p.Name, p => p.Value.Clone()) },
        ToolResultContent result => new ToolResultBlockParam { ToolUseID = result.ToolUseId, Content = result.Content, IsError = result.IsError },
        ThinkingContent thinking => new ThinkingBlockParam { Thinking = thinking.Thinking, Signature = thinking.Signature },
        _ => throw new ArgumentOutOfRangeException(nameof(content)),
    };

    private static ModelContent? FromBlock(ContentBlock block)
    {
        if (block.TryPickText(out TextBlock? text)) return new TextContent(text.Text);
        if (block.TryPickToolUse(out ToolUseBlock? use)) return new ToolUseContent(use.ID, use.Name, System.Text.Json.JsonSerializer.SerializeToElement(use.Input));
        if (block.TryPickThinking(out ThinkingBlock? thinking)) return new ThinkingContent(thinking.Thinking, thinking.Signature);
        return null;
    }

    private static ModelStopReason StopReasonOf(Message message)
    {
        var reason = message.StopReason?.ToString() ?? string.Empty;
        return reason switch
        {
            _ when reason.Contains("tool", StringComparison.OrdinalIgnoreCase) => ModelStopReason.ToolUse,
            _ when reason.Contains("refusal", StringComparison.OrdinalIgnoreCase) => ModelStopReason.Refusal,
            _ when reason.Contains("max", StringComparison.OrdinalIgnoreCase) => ModelStopReason.MaxTokens,
            _ => ModelStopReason.EndTurn,
        };
    }
}
