namespace Giddy.Domain.Catalogue;

/// <summary>What parents need to choose an entertainer, activity, rental or food vendor.</summary>
public sealed class VendorProfile
{
    public string Emoji { get; set; } = "🎈";

    public decimal Rating { get; set; }

    public int ReviewCount { get; set; }

    public int? MinAge { get; set; }

    public int? MaxAge { get; set; }

    /// <summary>How long a show or activity runs.</summary>
    public int? DurationMinutes { get; set; }

    /// <summary>How many days' notice a bakery or caterer needs.</summary>
    public int? NoticeDays { get; set; }
}
