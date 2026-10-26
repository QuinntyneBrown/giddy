namespace Giddy.Application.Home;

/// <summary>The next child's birthday that has no party planned yet.</summary>
public sealed record UpcomingBirthday(Guid ChildId, string FirstName, int TurningAge, string Date, int DaysAway);
