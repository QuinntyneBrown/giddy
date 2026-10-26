namespace Giddy.Application.Agent.Model;

/// <summary>The model provider is down, overloaded or too slow; Giddy can't answer right now.</summary>
public sealed class ModelUnavailableException(string message, Exception? inner = null) : Exception(message, inner);
