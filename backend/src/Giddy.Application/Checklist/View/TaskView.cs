namespace Giddy.Application.Checklist.View;

/// <param name="Due">yyyy-MM-dd in Toronto, like every date in the API.</param>
/// <param name="GiddyCanDo">allergyList or rsvpReminder when Giddy can do the task; otherwise null.</param>
public sealed record TaskView(
    Guid Id,
    string Title,
    string Due,
    bool Done,
    string? DoneOn,
    bool Overdue,
    Guid OwnerId,
    string OwnerName,
    bool RemindMe,
    string? GiddyCanDo);
