namespace Giddy.Domain.Parties;

/// <summary>Checklist tasks Giddy can do itself, once the parent confirms.</summary>
public static class GiddyActions
{
    /// <summary>Send the booked venue each child's first name and allergy.</summary>
    public const string AllergyList = "allergyList";

    /// <summary>Remind every family who hasn't replied.</summary>
    public const string RsvpReminder = "rsvpReminder";
}
