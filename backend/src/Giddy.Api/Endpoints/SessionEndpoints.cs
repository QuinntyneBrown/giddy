using Giddy.Application.Common;
using Giddy.Api.Security;
using Microsoft.AspNetCore.Antiforgery;

namespace Giddy.Api.Endpoints;

public static class SessionEndpoints
{
    public static IEndpointRouteBuilder MapSessionEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/session", async (ICurrentParent parent, MediatR.ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new Giddy.Application.Parents.RecordParentCommand(), cancel);
            return new SessionResponse(parent.Id, parent.Name, parent.Email, parent.EmailVerified);
        });

        app.MapGet("/api/antiforgery", (HttpContext context, IAntiforgery antiforgery) =>
        {
            var tokens = antiforgery.GetAndStoreTokens(context);
            context.Response.Cookies.Append(AntiforgerySetup.RequestTokenCookie, tokens.RequestToken!, new CookieOptions
            {
                HttpOnly = false,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Path = "/",
            });
            return new AntiforgeryTokenResponse(tokens.RequestToken!);
        });

        return app;
    }
}
