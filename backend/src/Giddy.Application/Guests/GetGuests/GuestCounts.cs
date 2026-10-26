namespace Giddy.Application.Guests.GetGuests;

/// <param name="Invited">Everyone on the list.</param>
public sealed record GuestCounts(int Invited, int Coming, int Waiting, int CantCome, int NotSent);
