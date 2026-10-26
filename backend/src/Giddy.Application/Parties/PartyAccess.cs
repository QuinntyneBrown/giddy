namespace Giddy.Application.Parties;

public enum PartyAccess
{
    /// <summary>Owners, co-planners and viewers.</summary>
    Read,

    /// <summary>Owners and co-planners, and only while the party is not locked.</summary>
    Plan,

    /// <summary>Owners and co-planners, also after the party, for example to send thank-you notes.</summary>
    WrapUp,

    /// <summary>The owner only, for example to delete the party.</summary>
    Own,
}
