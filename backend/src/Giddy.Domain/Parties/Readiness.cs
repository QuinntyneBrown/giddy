namespace Giddy.Domain.Parties;

/// <summary>
/// How ready a party is: completed checklist tasks plus confirmed bookings, over all tasks plus
/// planned bookings, as a whole percentage. The same number appears everywhere.
/// </summary>
public static class Readiness
{
    public static int Of(Party party)
    {
        var total = party.Checklist.Count + party.BookingsToDo.Count;
        if (total == 0)
        {
            return 0;
        }

        var done = party.Checklist.Count(t => t.Done) + party.BookingsToDo.Count(b => b.Status == BookingStatus.Confirmed);
        return (int)Math.Round(100m * done / total, MidpointRounding.AwayFromZero);
    }
}
