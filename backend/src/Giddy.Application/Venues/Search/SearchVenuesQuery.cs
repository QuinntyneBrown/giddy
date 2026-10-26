using MediatR;

namespace Giddy.Application.Venues.Search;

/// <param name="PartyId">Search from this party's area; the parent must belong to it.</param>
/// <param name="PostalCode">Search from here when there is no party.</param>
/// <param name="Date">ISO date the party is on.</param>
/// <param name="RadiusKm">How far from the area to look.</param>
public sealed record SearchVenuesQuery(
    Guid? PartyId,
    string? PostalCode,
    string Date,
    int Guests,
    int RadiusKm,
    decimal? MaxPrice,
    bool Indoor,
    bool NutFree,
    bool Parking,
    bool StepFree,
    string Sort) : IRequest<VenueSearchResult>;
