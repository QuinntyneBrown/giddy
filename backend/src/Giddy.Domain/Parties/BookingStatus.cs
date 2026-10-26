namespace Giddy.Domain.Parties;

public enum BookingStatus
{
    ToBook,

    /// <summary>A quote was requested from the vendor.</summary>
    QuoteRequested,

    /// <summary>The vendor sent a quote; it is in the budget until confirmed or it expires.</summary>
    Quoted,

    Confirmed,
}
