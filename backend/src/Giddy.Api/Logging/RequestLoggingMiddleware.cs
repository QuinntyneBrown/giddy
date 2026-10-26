using System.Diagnostics;

namespace Giddy.Api.Logging;

/// <summary>
/// Logs every request with its final status. Registered outside the exception handler so handled
/// failures are logged with the status the client actually received.
/// </summary>
public sealed class RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var started = Stopwatch.GetTimestamp();
        try
        {
            await next(context);
        }
        finally
        {
            logger.LogInformation(
                "{Method} {Path} responded {StatusCode} in {ElapsedMs:0} ms",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                Stopwatch.GetElapsedTime(started).TotalMilliseconds);
        }
    }
}
