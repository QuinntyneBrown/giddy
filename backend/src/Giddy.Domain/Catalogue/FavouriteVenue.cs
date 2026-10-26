namespace Giddy.Domain.Catalogue;

/// <summary>A venue a family saved to come back to.</summary>
public sealed record FavouriteVenue(Guid FamilyId, Guid VenueId);
