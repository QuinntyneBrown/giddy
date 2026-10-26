using Giddy.Application.Budget.Track;
using Giddy.Domain.Parties;

namespace Giddy.Application.Budget;

/// <summary>
/// The budget as a view of the plan: Giddy's items take their status and amounts from bookings
/// and quotes, so deposits and quotes show without the parent editing anything.
/// </summary>
public sealed class BudgetProjection(SwapAdvisor swaps)
{
    public async Task<BudgetView> ViewAsync(Party party, CancellationToken cancellationToken)
    {
        var lines = party.BookingsToDo.OrderBy(b => PlanOrder(b.Category)).Select(Line)
            .Concat(party.Expenses.Select(e => new BudgetLine(e.CostId.ToString(), "expense", e.Category, e.Description, e.Paid ? "paid" : "estimate", e.Amount, e.Paid ? e.Amount : 0)))
            .ToList();
        var planned = lines.Sum(l => l.Planned);
        var paid = lines.Sum(l => l.Paid);
        var overBy = party.Budget is { } budget ? Math.Max(0, planned - budget) : 0;
        return new BudgetView(
            party.Budget,
            planned,
            paid,
            party.Budget is { } total ? total - planned : null,
            party.GuestCount is > 0 ? Math.Round(planned / party.GuestCount.Value, 0, MidpointRounding.AwayFromZero) : null,
            overBy > 0,
            overBy,
            lines.GroupBy(l => l.Category).Select(g => new CategoryTotal(g.Key, g.Sum(l => l.Planned))).ToList(),
            lines,
            overBy > 0 ? await swaps.SuggestAsync(party, overBy, cancellationToken) : []);
    }

    private static int PlanOrder(string category)
    {
        var index = Array.IndexOf(["Venue", "Entertainer", "Activity", "Cake", "Food", "Loot bags", "Rental"], category);
        return index < 0 ? int.MaxValue : index;
    }

    private static BudgetLine Line(BookingToDo item) => new(
        $"plan:{item.Category}",
        "plan",
        item.Category,
        item.Name,
        item.Status switch
        {
            BookingStatus.Quoted => "quoted",
            BookingStatus.Confirmed when item.Paid >= item.Estimate => "paid",
            BookingStatus.Confirmed when item.Paid > 0 => "depositPaid",
            BookingStatus.Confirmed => "booked",
            _ => "estimate",
        },
        item.Estimate,
        item.Paid);
}
