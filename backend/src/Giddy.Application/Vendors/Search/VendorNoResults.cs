namespace Giddy.Application.Vendors.Search;

/// <param name="Conflicts">The filters in force, for example "under $100".</param>
public sealed record VendorNoResults(IReadOnlyList<string> Conflicts, VendorSuggestion? Suggestion);
