namespace Giddy.Application.Venues.Search;

/// <param name="Conflicts">The active filters in words, for example "under $250", "with a nut-free kitchen".</param>
public sealed record NoResultsHint(IReadOnlyList<string> Conflicts, RelaxationSuggestion? Suggestion);
