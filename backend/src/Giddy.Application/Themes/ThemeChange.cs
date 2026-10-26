namespace Giddy.Application.Themes;

/// <param name="Previous">The theme before, for Undo; null when there was none.</param>
public sealed record ThemeChange(string? Theme, PreviousTheme? Previous);
