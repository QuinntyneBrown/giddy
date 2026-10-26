using Microsoft.AspNetCore.Antiforgery;

namespace Giddy.Api.Security;

/// <summary>Rejects state-changing API requests that do not carry a valid anti-forgery token.</summary>
public sealed class AntiforgeryValidationMiddleware(RequestDelegate next, IAntiforgery antiforgery)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (IsStateChanging(context.Request))
        {
            try
            {
                await antiforgery.ValidateRequestAsync(context);
            }
            catch (AntiforgeryValidationException)
            {
                await Results.Problem(
                    title: "Your session needs refreshing. Reload the page and try again.",
                    statusCode: StatusCodes.Status400BadRequest).ExecuteAsync(context);
                return;
            }
        }

        await next(context);
    }

    // RSVP and unsubscribe links carry their credential in the URL and the webhooks a shared secret
    // header; none uses the session cookie, so cross-site request forgery does not apply to them.
    private static bool IsStateChanging(HttpRequest request) =>
        request.Path.StartsWithSegments("/api")
        && !request.Path.StartsWithSegments("/api/rsvp")
        && !request.Path.StartsWithSegments("/api/email-events")
        && !request.Path.StartsWithSegments("/api/vendor-quotes")
        && !request.Path.StartsWithSegments("/api/sms-events")
        && !request.Path.StartsWithSegments("/api/unsubscribe")
        && !(HttpMethods.IsGet(request.Method) || HttpMethods.IsHead(request.Method) || HttpMethods.IsOptions(request.Method));
}
