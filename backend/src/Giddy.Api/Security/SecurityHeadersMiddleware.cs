namespace Giddy.Api.Security;

public sealed class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;
        headers.TryAdd("X-Content-Type-Options", "nosniff");
        headers.TryAdd("Referrer-Policy", "strict-origin-when-cross-origin");
        headers.TryAdd(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
        headers.TryAdd("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

        await next(context);
    }
}
