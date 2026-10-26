using Giddy.Domain.Parties;

namespace Giddy.Domain.Places;

/// <summary>
/// Turns a postal code into a party area: a neighbourhood name parents recognise and the point
/// distances are measured from. Unknown forward sortation areas fall back to their region.
/// </summary>
public static class GtaAreas
{
    public const int DefaultRadiusKm = 10;

    private static readonly Dictionary<string, (string Name, double Lat, double Lng)> Known = new(StringComparer.Ordinal)
    {
        ["M4M"] = ("Leslieville", 43.6626, -79.3313),
        ["M4L"] = ("The Beaches", 43.6727, -79.2995),
        ["M4K"] = ("Riverdale", 43.6795, -79.3525),
        ["M4J"] = ("East York", 43.6853, -79.3381),
        ["M4E"] = ("The Beaches", 43.6763, -79.2930),
        ["M5A"] = ("Corktown", 43.6543, -79.3606),
        ["M5V"] = ("CityPlace", 43.6428, -79.3962),
        ["M6G"] = ("Christie Pits", 43.6696, -79.4225),
        ["M6H"] = ("Dovercourt", 43.6690, -79.4423),
        ["M6P"] = ("High Park", 43.6616, -79.4648),
        ["M2N"] = ("Willowdale", 43.7701, -79.4085),
        ["M1B"] = ("Malvern", 43.8067, -79.1944),
        ["M1P"] = ("Scarborough Town Centre", 43.7574, -79.2731),
        ["M9W"] = ("Rexdale", 43.7067, -79.5941),
        ["L6J"] = ("Oakville", 43.4500, -79.6833),
        ["L4C"] = ("Richmond Hill", 43.8756, -79.4381),
        ["L5B"] = ("Mississauga City Centre", 43.5890, -79.6441),
        ["L1S"] = ("Ajax", 43.8509, -79.0204),
    };

    private static readonly Dictionary<string, (double Lat, double Lng)> RegionCentres = new()
    {
        ["Toronto"] = (43.6532, -79.3832),
        ["Durham"] = (43.8971, -78.8658),
        ["York"] = (43.8828, -79.4403),
        ["Peel"] = (43.6834, -79.7663),
        ["Halton"] = (43.4675, -79.6877),
    };

    public static PartyArea Resolve(PostalCode postalCode)
    {
        if (Known.TryGetValue(postalCode.Fsa, out var known))
        {
            return new PartyArea(known.Name, known.Lat, known.Lng, DefaultRadiusKm);
        }

        var region = GtaServiceArea.RegionOf(postalCode);
        if (region is null)
        {
            var toronto = RegionCentres["Toronto"];
            return new PartyArea($"Outside the GTA ({postalCode.Fsa})", toronto.Lat, toronto.Lng, DefaultRadiusKm, InServiceArea: false);
        }

        var centre = RegionCentres[region];
        return new PartyArea($"{region} ({postalCode.Fsa})", centre.Lat, centre.Lng, DefaultRadiusKm);
    }
}
