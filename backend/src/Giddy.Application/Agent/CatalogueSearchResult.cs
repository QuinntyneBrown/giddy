namespace Giddy.Application.Agent;

/// <param name="Checked">Items in the area that were checked.</param>
/// <param name="Matches">Items that fit the date, area and guests.</param>
/// <param name="AllergySafe">Matches compatible with every allergy on the party.</param>
public sealed record CatalogueSearchResult(string Json, int Checked, int Matches, int AllergySafe);
