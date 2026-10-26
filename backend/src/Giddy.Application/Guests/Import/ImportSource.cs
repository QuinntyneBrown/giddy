namespace Giddy.Application.Guests.Import;

/// <summary>One of the parent's other parties whose guests can be reused.</summary>
public sealed record ImportSource(Guid PartyId, string Name, string Date, int Guests);
