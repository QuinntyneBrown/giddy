using Giddy.Application.Notifications.Inbox;
using MediatR;

namespace Giddy.Api.Endpoints;

/// <summary>The signed-in parent's notification centre.</summary>
public static class NotificationEndpoints
{
    public static IEndpointRouteBuilder MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        var notifications = app.MapGroup("/api/notifications");
        notifications.MapGet("/", (ISender sender, CancellationToken cancel) => sender.Send(new GetInboxQuery(), cancel));
        notifications.MapGet("/unread-count", (ISender sender, CancellationToken cancel) => sender.Send(new GetUnreadCountQuery(), cancel));
        notifications.MapPost("/{itemId:guid}/read", (Guid itemId, ISender sender, CancellationToken cancel) => sender.Send(new MarkReadCommand(itemId), cancel));
        notifications.MapPost("/read-all", (ISender sender, CancellationToken cancel) => sender.Send(new MarkReadCommand(null), cancel));
        return app;
    }
}
