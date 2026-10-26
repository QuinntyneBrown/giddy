using NodaTime;

namespace Giddy.Domain.Families;

/// <summary>A child in the family, whose birthdays Giddy plans for.</summary>
public sealed record Child(Guid Id, string FirstName, LocalDate Birthday)
{
    /// <summary>The next birthday on or after <paramref name="today"/>.</summary>
    public LocalDate NextBirthday(LocalDate today)
    {
        var thisYear = BirthdayIn(today.Year);
        return thisYear >= today ? thisYear : BirthdayIn(today.Year + 1);
    }

    /// <summary>The age the child turns on their next birthday.</summary>
    public int TurningAge(LocalDate today) => NextBirthday(today).Year - Birthday.Year;

    private LocalDate BirthdayIn(int year) =>
        Birthday.Month == 2 && Birthday.Day == 29 && !CalendarSystem.Iso.IsLeapYear(year)
            ? new LocalDate(year, 2, 28)
            : new LocalDate(year, Birthday.Month, Birthday.Day);
}
