namespace Giddy.Domain.Catalogue;

/// <summary>What parents need to choose a venue, beyond the catalogue basics.</summary>
public sealed class VenueProfile
{
    public string Emoji { get; set; } = "🎈";

    public string Address { get; set; } = string.Empty;

    public decimal Rating { get; set; }

    public int ReviewCount { get; set; }

    public int MinAge { get; set; }

    public int MaxAge { get; set; }

    public int DurationMinutes { get; set; }

    public bool Indoor { get; set; } = true;

    public bool PartyHost { get; set; }

    /// <summary>How the venue suits a theme, for example "Dino theme room".</summary>
    public string? ThemeFit { get; set; }

    public string PhotoDescription { get; set; } = string.Empty;

    /// <summary>The room the party has, for example "Fossil Room".</summary>
    public string Room { get; set; } = "Party room";

    /// <summary>Who the parent deals with, for example "Bea at 416-555-0142".</summary>
    public string? Contact { get; set; }

    /// <summary>The deposit taken when booking, in Canadian dollars.</summary>
    public decimal Deposit { get; set; } = 100;

    /// <summary>How many days before the party the deposit stops being refundable.</summary>
    public int FreeCancellationDays { get; set; } = 14;

    public List<VenueSlot> Slots { get; set; } = [];

    public List<BookedSlot> Booked { get; set; } = [];

    public List<string> Includes { get; set; } = [];

    public List<VenueAddOn> AddOns { get; set; } = [];

    public List<VenueReview> Reviews { get; set; } = [];
}
