using Giddy.Api.Security;
using Giddy.Application.Rsvps.GetCalendar;
using Giddy.Application.Rsvps.GetRsvp;
using Giddy.Application.Rsvps.SubmitRsvp;
using MediatR;

namespace Giddy.Api.Endpoints;

/// <summary>Guest parents reply through their private link; these endpoints are deliberately anonymous.</summary>
public static class RsvpEndpoints
{
    public static IEndpointRouteBuilder MapRsvpEndpoints(this IEndpointRouteBuilder app)
    {
        var rsvp = app.MapGroup("/api/rsvp/{token}").AllowAnonymous().RequireRateLimiting(RateLimitSetup.Rsvp);

        rsvp.MapGet("/", (string token, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetRsvpQuery(token), cancel));

        rsvp.MapPut("/", (string token, SubmitRsvpRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(
                new SubmitRsvpCommand(token, request.Coming, request.Allergies, request.ParentStaying, request.Siblings, request.ParentName ?? string.Empty, request.Mobile, request.Note),
                cancel));

        rsvp.MapGet("/calendar.ics", async (string token, ISender sender, CancellationToken cancel) =>
            Results.Text(await sender.Send(new GetCalendarQuery(token), cancel), "text/calendar", System.Text.Encoding.UTF8));

        return app;
    }
}
