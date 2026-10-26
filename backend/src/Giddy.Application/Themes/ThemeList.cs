namespace Giddy.Application.Themes;

/// <param name="Total">Every theme in the catalogue, before filters.</param>
public sealed record ThemeList(int Total, ThemeChild? Child, bool ForChild, string? PartyTheme, IReadOnlyList<ThemeView> Results);
