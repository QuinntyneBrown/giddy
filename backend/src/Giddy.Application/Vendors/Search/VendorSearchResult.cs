namespace Giddy.Application.Vendors.Search;

/// <param name="Place">Where vendors must travel or deliver to: the booked venue, or the party's area.</param>
/// <param name="Allergies">The allergies to plan for, by allergen and child; filled for food.</param>
public sealed record VendorSearchResult(
    string Category,
    string Date,
    string? Place,
    string? Theme,
    bool ThemeOn,
    IReadOnlyList<VendorResult> Results,
    IReadOnlyList<AllergyGroup> Allergies,
    VendorNoResults? NoResults);
