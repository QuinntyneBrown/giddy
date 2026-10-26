namespace Giddy.Application.Families;

/// <param name="NextBirthday">ISO calendar date.</param>
public sealed record ChildView(Guid Id, string FirstName, string Birthday, string NextBirthday, int TurningAge);
