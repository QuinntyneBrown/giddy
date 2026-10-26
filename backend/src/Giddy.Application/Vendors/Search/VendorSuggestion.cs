namespace Giddy.Application.Vendors.Search;

/// <param name="Filter">maxPrice or theme.</param>
public sealed record VendorSuggestion(string Label, string Filter, string Value);
