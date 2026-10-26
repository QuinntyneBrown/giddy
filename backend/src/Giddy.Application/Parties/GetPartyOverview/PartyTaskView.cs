namespace Giddy.Application.Parties.GetPartyOverview;

/// <param name="Due">ISO calendar date.</param>
public sealed record PartyTaskView(string Title, string Due, bool Overdue);
