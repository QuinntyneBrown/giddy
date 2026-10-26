using Giddy.Application.Bookings.BookVenue;

namespace Giddy.Api.Endpoints;

public sealed record BookVenueRequest(
    Guid VenueId, string? Date, string? Start, string? BookingName, string? Mobile, string? Child, string? Notes, PaymentChoice? Payment);
