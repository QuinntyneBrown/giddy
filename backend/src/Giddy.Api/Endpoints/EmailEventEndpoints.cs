using System.Security.Cryptography;
using System.Text;
using Giddy.Application.Guests.RecordEmailEvent;
using MediatR;

namespace Giddy.Api.Endpoints;

/// <summary>The email provider's delivery webhook, authenticated by a shared secret from configuration.</summary>
public static class EmailEventEndpoints
{
    public const string SecretHeader = "X-Giddy-Webhook-Secret";

    public static IEndpointRouteBuilder MapEmailEventEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/email-events", async (HttpRequest http, EmailEventRequest request, IConfiguration configuration, ISender sender, CancellationToken cancel) =>
        {
            if (!SecretMatches(configuration["Giddy:EmailEventsSecret"], http.Headers[SecretHeader].ToString()))
            {
                return Results.Unauthorized();
            }

            await sender.Send(new RecordEmailEventCommand(request.Type ?? string.Empty, request.Reference), cancel);
            return Results.Accepted();
        }).AllowAnonymous();

        return app;
    }

    private static bool SecretMatches(string? expected, string actual) =>
        !string.IsNullOrEmpty(expected)
        && CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(actual));
}
