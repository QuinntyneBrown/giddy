namespace Giddy.Application.Vendors.Search;

/// <param name="Children">First names of the children with this allergy; empty when it was noted for the party.</param>
public sealed record AllergyGroup(string Allergen, IReadOnlyList<string> Children);
