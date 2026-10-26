namespace Giddy.Domain.Parties;

/// <summary>Something the parent still has to book themselves, with Giddy's tax-inclusive estimate.</summary>
/// <param name="Paid">What has been paid so far, for example a venue's deposit.</param>
public sealed record BookingToDo(string Category, string Name, decimal Estimate, Guid? CatalogueItemId, BookingStatus Status = BookingStatus.ToBook, decimal Paid = 0);
