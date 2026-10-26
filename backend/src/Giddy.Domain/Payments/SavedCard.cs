using NodaTime;

namespace Giddy.Domain.Payments;

/// <summary>A card a parent chose to keep for next time: the provider's token, never the card number.</summary>
public sealed class SavedCard
{
    private SavedCard()
    {
        ProviderToken = string.Empty;
        Brand = string.Empty;
        Last4 = string.Empty;
    }

    public SavedCard(Guid id, Guid parentId, string providerToken, string brand, string last4, Instant createdAt)
    {
        Id = id;
        ParentId = parentId;
        ProviderToken = providerToken;
        Brand = brand;
        Last4 = last4;
        CreatedAt = createdAt;
    }

    public Guid Id { get; private set; }

    public Guid ParentId { get; private set; }

    public string ProviderToken { get; private set; }

    public string Brand { get; private set; }

    public string Last4 { get; private set; }

    public Instant CreatedAt { get; private set; }
}
