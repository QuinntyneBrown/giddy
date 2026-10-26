namespace Giddy.Application.Bookings.GetBookingNotices;

/// <param name="Kind">hold, confirmed, declined or disruption.</param>
/// <param name="Tone">info, success, warning or danger.</param>
/// <param name="Dismissible">False for banners that stay until the problem is fixed or the party has happened.</param>
public sealed record BookingNotice(string Kind, string Tone, string Title, string Text, bool Dismissible, Guid? BookingId, Guid? VenueId);
