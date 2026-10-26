namespace Giddy.Api.Authentication;

/// <summary>Names a device the way a parent would recognise it, such as "Safari on iPhone".</summary>
public static class DeviceNames
{
    public static string Describe(string? userAgent)
    {
        var ua = userAgent ?? string.Empty;
        var system = ua.Contains("iPhone", StringComparison.Ordinal) ? "iPhone"
            : ua.Contains("iPad", StringComparison.Ordinal) ? "iPad"
            : ua.Contains("Android", StringComparison.Ordinal) ? "Android"
            : ua.Contains("Windows", StringComparison.Ordinal) ? "Windows"
            : ua.Contains("Mac OS X", StringComparison.Ordinal) ? "macOS"
            : ua.Contains("Linux", StringComparison.Ordinal) ? "Linux"
            : "an unknown device";
        var browser = ua.Contains("Edg/", StringComparison.Ordinal) ? "Edge"
            : ua.Contains("Firefox/", StringComparison.Ordinal) ? "Firefox"
            : ua.Contains("Chrome/", StringComparison.Ordinal) || ua.Contains("CriOS/", StringComparison.Ordinal) ? "Chrome"
            : ua.Contains("Safari/", StringComparison.Ordinal) ? "Safari"
            : "A browser";
        return $"{browser} on {system}";
    }

    /// <summary>The rough place the request came from, as the edge network reports it.</summary>
    public static string Locate(HttpRequest request) =>
        request.Headers["X-Client-City"].FirstOrDefault() is { Length: > 0 } city ? city : "a place we couldn’t identify";
}
