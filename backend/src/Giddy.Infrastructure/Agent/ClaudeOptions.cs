namespace Giddy.Infrastructure.Agent;

/// <summary>Configuration section "Claude". The API key comes from ANTHROPIC_API_KEY, never the repository.</summary>
public sealed class ClaudeOptions
{
    public string Model { get; set; } = "claude-opus-5-5";

    public int MaxTokens { get; set; } = 16000;

    /// <summary>The longest one model request may take before Giddy says it can't answer right now.</summary>
    public TimeSpan RequestTimeout { get; set; } = TimeSpan.FromSeconds(60);
}
