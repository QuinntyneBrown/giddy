namespace Giddy.Application.Guests.GetGuests;

public sealed record GuestListView(IReadOnlyList<GuestView> Guests, GuestCounts Counts, IReadOnlyList<AllergyEntry> AllergyList);
