namespace Giddy.Application.Families;

/// <param name="AreaName">The neighbourhood for the postal code, for example Leslieville.</param>
public sealed record FamilyView(string? PostalCode, string? AreaName, IReadOnlyList<ChildView> Children);
