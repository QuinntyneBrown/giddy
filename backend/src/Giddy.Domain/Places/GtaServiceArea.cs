namespace Giddy.Domain.Places;

/// <summary>
/// The Greater Toronto Area Giddy serves: the City of Toronto and the Durham, York, Peel and Halton
/// regions, matched by forward sortation area.
/// </summary>
public static class GtaServiceArea
{
    private static readonly Dictionary<string, string> RegionsByFsa = BuildRegions();

    public static string? RegionOf(PostalCode postalCode)
    {
        if (postalCode.Fsa.StartsWith('M'))
        {
            return "Toronto";
        }

        return RegionsByFsa.GetValueOrDefault(postalCode.Fsa);
    }

    private static Dictionary<string, string> BuildRegions()
    {
        var regions = new Dictionary<string, string>(StringComparer.Ordinal);
        Add(regions, "Durham", "L1A L1B L1C L1E L1G L1H L1J L1K L1L L1M L1N L1P L1R L1S L1T L1V L1W L1X L1Y L1Z L9L L9P L0B L0C L0E");
        Add(regions, "York", "L3P L3R L3S L3T L3X L3Y L4A L4B L4C L4E L4G L4H L4J L4K L4L L4S L6A L6B L6C L6E L6G L0G L0H L0J");
        Add(regions, "Peel", "L4T L4V L4W L4X L4Y L4Z L5A L5B L5C L5E L5G L5H L5J L5K L5L L5M L5N L5R L5S L5T L5V L5W L6P L6R L6S L6T L6V L6W L6X L6Y L6Z L7A L7C L7E L7K L0N L0P");
        Add(regions, "Halton", "L6H L6J L6K L6L L6M L7G L7J L7L L7M L7N L7P L7R L7S L7T L9E L9T");
        return regions;
    }

    private static void Add(Dictionary<string, string> regions, string region, string fsas)
    {
        foreach (var fsa in fsas.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            regions[fsa] = region;
        }
    }
}
