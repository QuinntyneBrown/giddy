namespace Giddy.Application.Parties.ApplyPlan;

public sealed record PlanApplied(Guid PartyId, string PartyName, string Theme, int BookingsToDo, decimal Estimates, int ChecklistTasks);
