namespace Giddy.Application.Live;

/// <param name="Cursor">Pass it back as "after" to get only newer updates.</param>
public sealed record LiveUpdates(IReadOnlyList<LiveUpdate> Events, long Cursor);
