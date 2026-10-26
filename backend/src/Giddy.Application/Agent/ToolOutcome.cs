namespace Giddy.Application.Agent;

/// <param name="Result">What the model reads back.</param>
/// <param name="DoneText">The ticked step, for example "Checked 38 venues within 8 km for Sat 14 Nov afternoon".</param>
public sealed record ToolOutcome(string Result, string? DoneText, bool IsError = false);
