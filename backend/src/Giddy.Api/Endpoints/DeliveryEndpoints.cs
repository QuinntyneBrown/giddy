using Giddy.Api.Security;
using Giddy.Application.Notifications;
using Giddy.Application.Notifications.Push;
using Giddy.Application.Notifications.Sms;
using MediatR;

namespace Giddy.Api.Endpoints;

/// <summary>Replies to texts, one-click unsubscribe, and push subscriptions.</summary>
public static class DeliveryEndpoints
{
    public static IEndpointRouteBuilder MapDeliveryEndpoints(this IEndpointRouteBuilder app)
    {
        // The SMS provider's webhook, authenticated by a shared secret from configuration.
        app.MapPost("/api/sms-events", async (SmsEventRequest request, HttpContext context, IConfiguration configuration, ISender sender, CancellationToken cancel) =>
        {
            if (!SharedSecret.Matches(configuration["Giddy:SmsEventsSecret"], context.Request.Headers[SharedSecret.Header].ToString()))
            {
                return Results.Unauthorized();
            }

            await sender.Send(new RecordSmsReplyCommand(request.From ?? string.Empty, request.Text ?? string.Empty), cancel);
            return Results.NoContent();
        }).AllowAnonymous();

        // One click from a party-ideas email, without signing in (RFC 8058 posts; a browser gets).
        var unsubscribe = async (string? token, Unsubscribe unsubscribe, CancellationToken cancel) =>
            await unsubscribe.ApplyAsync(token ?? string.Empty, cancel)
                ? Results.Ok(new { message = "You won’t get party ideas from Giddy any more." })
                : Results.NotFound();
        app.MapPost("/api/unsubscribe", unsubscribe).AllowAnonymous().RequireRateLimiting(RateLimitSetup.Rsvp);
        app.MapGet("/api/unsubscribe", unsubscribe).AllowAnonymous().RequireRateLimiting(RateLimitSetup.Rsvp);

        app.MapPost("/api/push-subscriptions", async (PushSubscriptionRequest request, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new SavePushSubscriptionCommand(request.Endpoint ?? string.Empty, request.P256dh ?? string.Empty, request.Auth ?? string.Empty), cancel);
            return Results.NoContent();
        });
        app.MapDelete("/api/push-subscriptions", async ([Microsoft.AspNetCore.Mvc.FromBody] PushSubscriptionRequest request, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new RemovePushSubscriptionCommand(request.Endpoint ?? string.Empty), cancel);
            return Results.NoContent();
        });
        return app;
    }
}
