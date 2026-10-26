namespace Giddy.Domain.Guests;

public enum RsvpStatus
{
    /// <summary>On the list; the invitation has not gone out.</summary>
    NotSent,

    /// <summary>Invited; no reply yet.</summary>
    Waiting,

    Coming,

    CantCome,
}
