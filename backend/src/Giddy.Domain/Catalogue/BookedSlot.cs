using NodaTime;

namespace Giddy.Domain.Catalogue;

/// <summary>A slot already taken on a date.</summary>
public sealed record BookedSlot(LocalDate Date, LocalTime Start);
