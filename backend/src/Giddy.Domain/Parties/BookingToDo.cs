namespace Giddy.Domain.Parties;

/// <summary>Something the parent still has to book themselves, with Giddy's tax-inclusive estimate.</summary>
public sealed record BookingToDo(string Category, string Name, decimal Estimate, Guid? CatalogueItemId, BookingStatus Status = BookingStatus.ToBook);
