namespace Giddy.Application.Wrapping;

/// <summary>A venue or vendor the party booked, with this party's rating once given.</summary>
public sealed record ProviderView(Guid ProviderId, string Name, string Category, int? Stars, string? Review);
