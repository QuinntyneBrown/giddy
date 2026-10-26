using NodaTime;

namespace Giddy.Domain.Catalogue;

/// <summary>A party slot a venue offers every day, such as 1:00–3:30 pm.</summary>
public sealed record VenueSlot(LocalTime Start, LocalTime End);
