namespace Giddy.Application.Themes;

/// <param name="Id">The catalogue theme, or null when the old theme isn't in the catalogue.</param>
public sealed record PreviousTheme(Guid? Id, string Name);
