namespace Giddy.Application.Live;

public sealed record LiveUpdate(long Id, Guid PartyId, Guid? GuestId, string Kind, string Tone, string Title, string Text, LiveUpdateAction? Action);
