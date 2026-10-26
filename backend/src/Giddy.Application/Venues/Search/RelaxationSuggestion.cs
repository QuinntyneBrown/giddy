namespace Giddy.Application.Venues.Search;

/// <summary>One filter change that would bring results back, for example "Raise to $340".</summary>
public sealed record RelaxationSuggestion(string Label, string Filter, string Value, int Count);
