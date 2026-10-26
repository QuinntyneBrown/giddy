namespace Giddy.Application.Live;

/// <param name="Kind">share-allergies, fix-email or view-guests.</param>
public sealed record LiveUpdateAction(string Label, string Kind);
