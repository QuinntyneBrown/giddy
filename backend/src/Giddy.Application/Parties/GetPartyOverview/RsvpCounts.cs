namespace Giddy.Application.Parties.GetPartyOverview;

/// <summary>Replies so far; guests and RSVPs arrive with invitations.</summary>
public sealed record RsvpCounts(int Coming, int Waiting, int CantCome);
