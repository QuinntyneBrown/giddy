using NodaTime;

namespace Giddy.Domain.Guests;

/// <summary>A child invited to a party, with their parent's contact details and reply.</summary>
public sealed class Guest
{
    private Guest()
    {
        ChildName = string.Empty;
        ParentName = string.Empty;
    }

    public Guest(Guid id, Guid partyId, string childName, string parentName, string? email, string? mobile)
    {
        Id = id;
        PartyId = partyId;
        ChildName = childName.Trim();
        ParentName = parentName.Trim();
        Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        Mobile = string.IsNullOrWhiteSpace(mobile) ? null : mobile.Trim();
    }

    public Guid Id { get; private set; }

    public Guid PartyId { get; private set; }

    /// <summary>The child's full name, for example "Maya Chen".</summary>
    public string ChildName { get; private set; }

    public string ParentName { get; private set; }

    public string? Email { get; private set; }

    public string? Mobile { get; private set; }

    public RsvpStatus Rsvp { get; private set; } = RsvpStatus.NotSent;

    /// <summary>Allergies or dietary needs as the parent wrote them, for example "Dairy-free".</summary>
    public string? Allergies { get; private set; }

    public bool? ParentStaying { get; private set; }

    public int? Siblings { get; private set; }

    public string? Note { get; private set; }

    /// <summary>SHA-256 of the private RSVP link's token; the token itself is never stored.</summary>
    public string? TokenHash { get; private set; }

    /// <summary>The token encrypted with the app's data-protection keys, so reminders can repeat the link.</summary>
    public string? ProtectedToken { get; private set; }

    public Instant? InvitedAt { get; private set; }

    public Instant? OpenedAt { get; private set; }

    public Instant? RepliedAt { get; private set; }

    public Instant? LastRemindedAt { get; private set; }

    public bool EmailBounced { get; private set; }

    public string ChildFirstName => ChildName.Split(' ', StringSplitOptions.RemoveEmptyEntries)[0];

    /// <summary>"the Chen family", from the child's surname.</summary>
    public string FamilyName => ChildName.Contains(' ') ? $"the {ChildName.Split(' ', StringSplitOptions.RemoveEmptyEntries)[^1]} family" : $"{ChildFirstName}’s family";

    public bool HasAllergies => !string.IsNullOrWhiteSpace(Allergies);

    public void Invite(string tokenHash, string protectedToken, Instant now)
    {
        TokenHash = tokenHash;
        ProtectedToken = protectedToken;
        InvitedAt = now;
        if (Rsvp == RsvpStatus.NotSent)
        {
            Rsvp = RsvpStatus.Waiting;
        }
    }

    /// <returns>True the first time the guest opens the invitation.</returns>
    public bool RecordOpen(Instant now)
    {
        if (OpenedAt is not null)
        {
            return false;
        }

        OpenedAt = now;
        return true;
    }

    public void Reply(bool coming, string? allergies, bool? parentStaying, int? siblings, string parentName, string? mobile, string? note, Instant now)
    {
        Rsvp = coming ? RsvpStatus.Coming : RsvpStatus.CantCome;
        Allergies = string.IsNullOrWhiteSpace(allergies) ? null : allergies.Trim();
        ParentStaying = parentStaying;
        Siblings = siblings;
        ParentName = parentName.Trim();
        if (!string.IsNullOrWhiteSpace(mobile))
        {
            Mobile = mobile.Trim();
        }

        Note = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
        RepliedAt = now;
    }

    public void Remind(Instant now) => LastRemindedAt = now;

    public void Bounce() => EmailBounced = true;
}
