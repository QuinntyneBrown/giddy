using Giddy.Domain.Catalogue;
using NodaTime;

namespace Giddy.Application.Agent;

/// <summary>A catalogue item returned by a tool in this turn, and when its availability was checked.</summary>
public sealed record SeenItem(CatalogueItem Item, double DistanceKm, Instant CheckedAt);
