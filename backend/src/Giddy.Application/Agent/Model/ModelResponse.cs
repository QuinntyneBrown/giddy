namespace Giddy.Application.Agent.Model;

public sealed record ModelResponse(IReadOnlyList<ModelContent> Content, ModelStopReason StopReason);
