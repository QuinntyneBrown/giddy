namespace Giddy.Domain.Conversations;

/// <summary>One piece of work Giddy did for a reply, in plain words: "Checked 38 venues within 8 km…".</summary>
public sealed record ToolStep(string Text, bool Done);
