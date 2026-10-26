using NodaTime;

namespace Giddy.Domain.Wrapping;

/// <summary>
/// The parent's changes to a guest's thank-you note: the gift they logged, their own wording, and
/// when it was sent. Without a row, the note is Giddy's draft.
/// </summary>
public sealed class ThankYouNote
{
    private ThankYouNote()
    {
    }

    public ThankYouNote(Guid partyId, Guid guestId)
    {
        Id = Guid.NewGuid();
        PartyId = partyId;
        GuestId = guestId;
    }

    public Guid Id { get; private set; }

    public Guid PartyId { get; private set; }

    public Guid GuestId { get; private set; }

    /// <summary>What the guest gave, as the parent wrote it, for example "Dino excavation kit".</summary>
    public string? Gift { get; private set; }

    /// <summary>The parent's own wording; null keeps Giddy's draft, which follows the gift.</summary>
    public string? Message { get; private set; }

    public Instant? SentAt { get; private set; }

    public void Edit(string? gift, string? message)
    {
        Gift = string.IsNullOrWhiteSpace(gift) ? null : gift.Trim();
        Message = message?.Trim();
    }

    public void MarkSent(Instant now) => SentAt = now;
}
