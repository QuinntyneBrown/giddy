namespace Giddy.Domain.Wrapping;

/// <summary>A venue or vendor from a saved plan, to book again.</summary>
public sealed record TemplateBooking(string Category, string Name, decimal Estimate, Guid? CatalogueItemId);
