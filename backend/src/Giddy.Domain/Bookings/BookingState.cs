namespace Giddy.Domain.Bookings;

public enum BookingState
{
    /// <summary>The venue is holding the slot while the parent's bank checks it is them.</summary>
    Holding,

    Confirmed,

    /// <summary>The card was declined and the venue released the hold.</summary>
    Declined,

    /// <summary>The hold was released without a booking, so nothing was charged.</summary>
    Released,

    Cancelled,
}
