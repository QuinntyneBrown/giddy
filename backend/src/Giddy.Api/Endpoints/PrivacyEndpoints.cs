using Giddy.Application.Privacy;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace Giddy.Api.Endpoints;

public static class PrivacyEndpoints
{
    public static IEndpointRouteBuilder MapPrivacyEndpoints(this IEndpointRouteBuilder app)
    {
        var privacy = app.MapGroup("/api/privacy");
        privacy.MapPost("/export", async (ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new RequestExportCommand(), cancel);
            return Results.Accepted();
        });
        privacy.MapGet("/exports/{exportId:guid}", async (Guid exportId, ISender sender, CancellationToken cancel) =>
            Results.Text(await sender.Send(new GetExportQuery(exportId), cancel), "application/json"));
        privacy.MapGet("/deletion-check", (ISender sender, CancellationToken cancel) => sender.Send(new GetDeletionCheckQuery(), cancel));
        privacy.MapPost("/delete-account", async (EmailRequest request, HttpContext context, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new DeleteAccountCommand(request.Email ?? string.Empty), cancel);
            await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.NoContent();
        });
        return app;
    }
}
