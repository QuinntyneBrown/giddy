using Giddy.Application.Bookings;
using Giddy.Application.Bookings.BookVenue;
using Giddy.Application.Bookings.CancelBooking;
using Giddy.Application.Bookings.CompleteAuthentication;
using Giddy.Application.Bookings.GetBookingNotices;
using Giddy.Application.Payments;
using Giddy.Domain.Bookings;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class BookingEndpoints
{
    public static IEndpointRouteBuilder MapBookingEndpoints(this IEndpointRouteBuilder app)
    {
        var bookings = app.MapGroup("/api/parties/{partyId:guid}/bookings");

        bookings.MapPost("/", async (Guid partyId, BookVenueRequest request, ISender sender, CancellationToken cancel) =>
        {
            var booking = await sender.Send(
                new BookVenueCommand(
                    partyId, request.VenueId, request.Date ?? string.Empty, request.Start ?? string.Empty, request.BookingName ?? string.Empty,
                    request.Mobile ?? string.Empty, request.Child ?? string.Empty, request.Notes, request.Payment!),
                cancel);
            return Created(partyId, booking);
        });

        bookings.MapPost("/{bookingId:guid}/authentication", (Guid partyId, Guid bookingId, ISender sender, CancellationToken cancel) =>
            sender.Send(new CompleteAuthenticationCommand(partyId, bookingId), cancel));

        bookings.MapPost("/{bookingId:guid}/cancel", (Guid partyId, Guid bookingId, ISender sender, CancellationToken cancel) =>
            sender.Send(new CancelBookingCommand(partyId, bookingId), cancel));

        app.MapGet("/api/parties/{partyId:guid}/booking-notices", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetBookingNoticesQuery(partyId), cancel));

        app.MapGet("/api/payment-methods", (ISender sender, CancellationToken cancel) => sender.Send(new GetPaymentMethodsQuery(), cancel));

        return app;
    }

    private static IResult Created(Guid partyId, BookingView booking) => booking.State == BookingState.Confirmed
        ? Results.Created($"/api/parties/{partyId}/bookings/{booking.Id}", booking)
        : Results.Accepted($"/api/parties/{partyId}/bookings/{booking.Id}", booking);
}
