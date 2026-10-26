using NodaTime;

namespace Giddy.Domain.Live;

/// <summary>Something the host should hear about while Giddy is open, such as a reply or a bounce.</summary>
public sealed class PartyEvent
{
    private PartyEvent()
    {
        Kind = string.Empty;
        Tone = string.Empty;
        Title = string.Empty;
        Text = string.Empty;
    }

    public PartyEvent(Guid partyId, Guid? guestId, string kind, string tone, string title, string text, string? actionLabel, string? actionKind, Instant createdAt)
    {
        PartyId = partyId;
        GuestId = guestId;
        Kind = kind;
        Tone = tone;
        Title = title;
        Text = text;
        ActionLabel = actionLabel;
        ActionKind = actionKind;
        CreatedAt = createdAt;
    }

    /// <summary>Increasing, so clients can ask for everything after the last one they saw.</summary>
    public long Id { get; private set; }

    public Guid PartyId { get; private set; }

    public Guid? GuestId { get; private set; }

    /// <summary>opened, replied, changed, allergy or bounced.</summary>
    public string Kind { get; private set; }

    /// <summary>info, success, warning or danger.</summary>
    public string Tone { get; private set; }

    public string Title { get; private set; }

    public string Text { get; private set; }

    public string? ActionLabel { get; private set; }

    /// <summary>share-allergies, fix-email or view-guests.</summary>
    public string? ActionKind { get; private set; }

    public Instant CreatedAt { get; private set; }
}
