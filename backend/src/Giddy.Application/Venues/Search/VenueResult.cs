namespace Giddy.Application.Venues.Search;

/// <param name="FitWarning">Set when the venue holds fewer kids than invited, for example "Fits 15; you invited 16".</param>
public sealed record VenueResult(
    Guid Id,
    string Name,
    string Emoji,
    string Neighbourhood,
    double DistanceKm,
    int Capacity,
    int MinAge,
    int MaxAge,
    decimal Rating,
    int ReviewCount,
    IReadOnlyList<string> Features,
    decimal Price,
    int DurationMinutes,
    IReadOnlyList<SlotView> FreeSlots,
    string? FitWarning);
