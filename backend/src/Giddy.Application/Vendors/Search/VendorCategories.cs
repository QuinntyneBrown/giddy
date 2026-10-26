using Giddy.Domain.Catalogue;

namespace Giddy.Application.Vendors.Search;

/// <summary>The Fun &amp; food chips and the catalogue categories behind each.</summary>
public static class VendorCategories
{
    public static readonly IReadOnlyDictionary<string, CatalogueCategory[]> All = new Dictionary<string, CatalogueCategory[]>
    {
        ["entertainers"] = [CatalogueCategory.Entertainer],
        ["activities"] = [CatalogueCategory.Activity],
        ["food"] = [CatalogueCategory.Cake, CatalogueCategory.Food],
        ["rentals"] = [CatalogueCategory.Rental],
    };
}
