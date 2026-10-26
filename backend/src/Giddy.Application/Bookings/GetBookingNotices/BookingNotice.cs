namespace Giddy.Application.Bookings.GetBookingNotices;

/// <param name="Kind">hold, confirmed, declined, disruption or quote-expiring.</param>
/// <param name="Tone">info, success, warning or danger.</param>
/// <param name="Dismissible">False for banners that stay until the problem is fixed or the party has happened.</param>
/// <param name="QuoteId">For quote-expiring notices: the quote to confirm.</param>
/// <param name="Category">For quote-expiring notices: the vendor's category, to find another.</param>
public sealed record BookingNotice(string Kind, string Tone, string Title, string Text, bool Dismissible, Guid? BookingId, Guid? VenueId, Guid? QuoteId = null, string? Category = null);
