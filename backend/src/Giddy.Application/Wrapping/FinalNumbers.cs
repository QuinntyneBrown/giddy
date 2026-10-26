namespace Giddy.Application.Wrapping;

/// <param name="Spent">Everything in the budget: the plan's bookings and the parent's own costs.</param>
public sealed record FinalNumbers(int KidsCame, int Invited, decimal Spent, decimal? Budget, int Gifts);
