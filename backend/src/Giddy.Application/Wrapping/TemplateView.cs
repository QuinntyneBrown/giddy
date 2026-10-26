namespace Giddy.Application.Wrapping;

/// <param name="RemindOn">ISO date of the reminder, about eight weeks before the next birthday.</param>
public sealed record TemplateView(Guid TemplateId, string? RemindOn);
