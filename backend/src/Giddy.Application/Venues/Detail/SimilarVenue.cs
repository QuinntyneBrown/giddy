namespace Giddy.Application.Venues.Detail;

/// <summary>Another venue that is free on the date and fits the guests.</summary>
public sealed record SimilarVenue(Guid Id, string Name, double DistanceKm, decimal Price, string Start);
