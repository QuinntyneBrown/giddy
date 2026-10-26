using NodaTime;

namespace Giddy.Domain.Vendors;

/// <summary>A parent's request for a vendor's quote, and the vendor's reply.</summary>
public sealed class QuoteRequest
{
    private QuoteRequest()
    {
        VendorName = string.Empty;
        Category = string.Empty;
    }

    public QuoteRequest(Guid id, Guid partyId, Guid vendorId, string vendorName, string category, Guid requestedBy, Instant requestedAt)
    {
        Id = id;
        PartyId = partyId;
        VendorId = vendorId;
        VendorName = vendorName;
        Category = category;
        RequestedBy = requestedBy;
        RequestedAt = requestedAt;
    }

    public Guid Id { get; private set; }

    public Guid PartyId { get; private set; }

    public Guid VendorId { get; private set; }

    public string VendorName { get; private set; }

    /// <summary>The plan's category for the vendor, for example "Entertainer".</summary>
    public string Category { get; private set; }

    public Guid RequestedBy { get; private set; }

    public Instant RequestedAt { get; private set; }

    public QuoteStatus Status { get; private set; } = QuoteStatus.Requested;

    public decimal? Amount { get; private set; }

    public LocalDate? ExpiresOn { get; private set; }

    public string? Note { get; private set; }

    public void Quote(decimal amount, LocalDate expiresOn, string? note)
    {
        Status = QuoteStatus.Quoted;
        Amount = amount;
        ExpiresOn = expiresOn;
        Note = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
    }

    public void Accept() => Status = QuoteStatus.Accepted;
}
