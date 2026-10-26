namespace Giddy.Application.Families;

/// <param name="Birthday">ISO calendar date.</param>
/// <param name="NextBirthday">ISO calendar date.</param>
/// <param name="DaysUntil">Calendar days from today in Toronto to the next birthday.</param>
/// <param name="PartyId">The party planned for the next birthday, if there is one.</param>
public sealed record ChildView(
    Guid Id,
    string FirstName,
    string Birthday,
    string NextBirthday,
    int TurningAge,
    int DaysUntil,
    IReadOnlyList<string> Interests,
    string? Allergies,
    Guid? PartyId);
