namespace Giddy.Domain.Proposals;

/// <summary>One line of a plan card. Name and price come from the catalogue, never from the model.</summary>
public sealed record ProposalItem(
    string Category,
    Guid CatalogueItemId,
    string Name,
    string Detail,
    decimal Price,
    string? AllergyNote);
