namespace Giddy.Application.Sharing;

/// <param name="Url">The web app's path for the link, such as /shared/abc.</param>
public sealed record ShareLink(string Token, string Url);
