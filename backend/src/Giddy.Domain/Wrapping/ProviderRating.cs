using NodaTime;

namespace Giddy.Domain.Wrapping;

/// <summary>A party's 1 to 5 star rating of a venue or vendor it booked, with an optional review.</summary>
public sealed class ProviderRating
{
    private ProviderRating()
    {
    }

    public ProviderRating(Guid partyId, Guid providerId)
    {
        Id = Guid.NewGuid();
        PartyId = partyId;
        ProviderId = providerId;
    }

    public Guid Id { get; private set; }

    public Guid PartyId { get; private set; }

    public Guid ProviderId { get; private set; }

    public Guid RatedBy { get; private set; }

    /// <summary>0 until the first rating.</summary>
    public int Stars { get; private set; }

    public string? Review { get; private set; }

    public Instant RatedAt { get; private set; }

    public bool IsNew => Stars == 0;

    public void Rate(int stars, string? review, Guid parentId, Instant now)
    {
        Stars = stars;
        Review = string.IsNullOrWhiteSpace(review) ? null : review.Trim();
        RatedBy = parentId;
        RatedAt = now;
    }
}
