namespace Giddy.Application.Vendors.Search;

/// <summary>Whether a vendor can meet one of the party's allergies.</summary>
public sealed record AllergyFit(string Allergen, bool Ok);
