using Giddy.Application.Settings;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        var settings = app.MapGroup("/api/settings");
        settings.MapGet("/", (ISender sender, CancellationToken cancel) => sender.Send(new GetSettingsQuery(), cancel));
        settings.MapPut("/profile", (ProfileRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new UpdateProfileCommand(request.FirstName ?? string.Empty, request.LastName, request.Mobile, request.PostalCode), cancel));
        settings.MapPost("/email", async (EmailRequest request, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new RequestEmailChangeCommand(request.Email ?? string.Empty), cancel);
            return Results.Accepted();
        });
        settings.MapPut("/quiet-hours", (QuietHoursRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new SetQuietHoursCommand(request.On), cancel));
        settings.MapPut("/notifications", (NotificationChoices request, ISender sender, CancellationToken cancel) =>
            sender.Send(new SetNotificationsCommand(request), cancel));
        return app;
    }
}
