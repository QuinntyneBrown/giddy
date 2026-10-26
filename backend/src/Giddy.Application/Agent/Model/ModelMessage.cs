namespace Giddy.Application.Agent.Model;

public sealed record ModelMessage(ModelRole Role, IReadOnlyList<ModelContent> Content);
