namespace Giddy.Application.Places.CheckServiceArea;

/// <param name="Region">Toronto, Durham, York, Peel or Halton; null outside the GTA.</param>
public sealed record ServiceArea(string PostalCode, bool InServiceArea, string? Region);
