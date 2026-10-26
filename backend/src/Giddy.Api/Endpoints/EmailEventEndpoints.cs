using Giddy.Api.Security;
using Giddy.Application.Guests.RecordEmailEvent;
using MediatR;

namespace Giddy.Api.Endpoints;

/// <summary>The email provider's delivery webhook, authenticated by a shared secret from configuration.</summary>
public static class EmailEventEndpoints
{
    public static IEndpointRouteBuilder MapEmailEventEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/email-events", async (HttpRequest http, EmailEventRequest request, IConfiguration configuration, ISender sender, CancellationToken cancel) =>
        {
            if (!SharedSecret.Matches(configuration["Giddy:EmailEventsSecret"], http.Headers[SharedSecret.Header].ToString()))
            {
                return Results.Unauthorized();
            }

            await sender.Send(new RecordEmailEventCommand(request.Type ?? string.Empty, request.Reference), cancel);
            return Results.Accepted();
        }).AllowAnonymous();

        return app;
    }
}
