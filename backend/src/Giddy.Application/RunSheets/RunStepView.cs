namespace Giddy.Application.RunSheets;

/// <param name="Time">HH:mm in Toronto.</param>
public sealed record RunStepView(Guid Id, string Time, string Title, string Details, string Who, string? Reminder);
