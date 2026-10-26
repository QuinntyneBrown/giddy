using Giddy.Domain.Catalogue;

namespace Giddy.Application.Venues;

public static class VenueFeatures
{
    public const string NutFreeKitchen = "nut-free kitchen";
    public const string Parking = "parking";
    public const string StepFree = "step-free";

    /// <summary>Features as parents read them, for example "Nut-free kitchen".</summary>
    public static IReadOnlyList<string> Display(CatalogueItem venue) =>
        venue.Features.Where(f => f != "indoor").Select(f => char.ToUpperInvariant(f[0]) + f[1..]).ToList();

    public static string Duration(int minutes) =>
        minutes % 60 == 0 ? $"{minutes / 60} h" : $"{minutes / 60.0:0.#} h";
}
