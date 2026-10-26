using Giddy.Domain.Parties;

namespace Giddy.Application.Parties;

public static class NextStep
{
    /// <summary>The first thing still to book, otherwise the next unfinished task.</summary>
    public static string? Of(Party party) =>
        party.BookingsToDo.FirstOrDefault(b => b.Status == BookingStatus.ToBook) is { } booking
            ? $"Book {booking.Name}"
            : party.Checklist.Where(t => !t.Done).OrderBy(t => t.Due).FirstOrDefault()?.Title;
}
