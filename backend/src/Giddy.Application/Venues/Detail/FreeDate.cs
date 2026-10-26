namespace Giddy.Application.Venues.Detail;

/// <summary>The nearest date this venue has a free slot.</summary>
public sealed record FreeDate(string Date, string Start, string End);
