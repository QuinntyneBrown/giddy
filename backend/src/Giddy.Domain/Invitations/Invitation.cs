using NodaTime;

namespace Giddy.Domain.Invitations;

/// <summary>A party's invitation: its design and words, the RSVP-by date, the questions and the channels.</summary>
public sealed class Invitation
{
    public const int HeadlineMaxLength = 60;
    public const int MessageMaxLength = 280;

    private Invitation()
    {
        Design = string.Empty;
        Headline = string.Empty;
        Message = string.Empty;
    }

    public Invitation(Guid partyId, string design, string headline, string message, LocalDate rsvpBy)
    {
        PartyId = partyId;
        Design = design;
        Headline = headline;
        Message = message;
        RsvpBy = rsvpBy;
    }

    public Guid PartyId { get; private set; }

    public string Design { get; private set; }

    public string Headline { get; private set; }

    public string Message { get; private set; }

    public LocalDate RsvpBy { get; private set; }

    public bool AskAllergies { get; private set; } = true;

    public bool AskParentStaying { get; private set; } = true;

    public bool AskSiblings { get; private set; }

    public bool ByEmail { get; private set; } = true;

    public bool ByText { get; private set; } = true;

    public Instant? SentAt { get; private set; }

    public void Edit(string design, string headline, string message, LocalDate rsvpBy, bool askAllergies, bool askParentStaying, bool askSiblings, bool byEmail, bool byText)
    {
        Design = design;
        Headline = headline.Trim();
        Message = message.Trim();
        RsvpBy = rsvpBy;
        AskAllergies = askAllergies;
        AskParentStaying = askParentStaying;
        AskSiblings = askSiblings;
        ByEmail = byEmail;
        ByText = byText;
    }

    public void MarkSent(Instant now) => SentAt ??= now;

    /// <summary>Giddy reminds families who haven't replied three days before the RSVP-by date.</summary>
    public LocalDate AutomaticReminderOn => RsvpBy.PlusDays(-3);
}
