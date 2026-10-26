using NodaTime;

namespace Giddy.Domain.Catalogue;

/// <summary>
/// A theme, venue or vendor Giddy can propose. Prices are tax-inclusive Canadian dollars for the
/// party described by <see cref="PriceBasis"/>. Description text comes from the listing and is
/// untrusted third-party content.
/// </summary>
public sealed class CatalogueItem
{
    private CatalogueItem()
    {
        Name = string.Empty;
        Description = string.Empty;
        Neighbourhood = string.Empty;
        PriceBasis = string.Empty;
    }

    public CatalogueItem(
        Guid id,
        CatalogueCategory category,
        string name,
        string description,
        string neighbourhood,
        double latitude,
        double longitude,
        int serviceRadiusKm,
        int? capacity,
        decimal price,
        string priceBasis)
    {
        Id = id;
        Category = category;
        Name = name;
        Description = description;
        Neighbourhood = neighbourhood;
        Latitude = latitude;
        Longitude = longitude;
        ServiceRadiusKm = serviceRadiusKm;
        Capacity = capacity;
        Price = price;
        PriceBasis = priceBasis;
    }

    public Guid Id { get; private set; }

    public CatalogueCategory Category { get; private set; }

    public string Name { get; private set; }

    public string Description { get; private set; }

    public string Neighbourhood { get; private set; }

    public double Latitude { get; private set; }

    public double Longitude { get; private set; }

    /// <summary>How far the vendor travels, or for a venue how far families come from.</summary>
    public int ServiceRadiusKm { get; private set; }

    /// <summary>The most children the venue or service can host; null when it does not apply.</summary>
    public int? Capacity { get; private set; }

    public decimal Price { get; private set; }

    /// <summary>What the price covers, for example "2.5 hours, up to 20 kids".</summary>
    public string PriceBasis { get; private set; }

    public string[] Features { get; private set; } = [];

    /// <summary>Allergens the item is free of, for example "peanut", "gluten".</summary>
    public string[] AllergyFree { get; private set; } = [];

    public string[] Themes { get; private set; } = [];

    public LocalDate[] UnavailableDates { get; private set; } = [];

    /// <summary>Venue-only details; null for themes and vendors.</summary>
    public VenueProfile? Venue { get; private set; }

    public VendorProfile? Vendor { get; private set; }

    public ThemeProfile? ThemeInfo { get; private set; }

    /// <summary>The person to ask for on the day, such as the venue's host; null for the business itself.</summary>
    public string? ContactName { get; private set; }

    /// <summary>Digits only, for a tel: link, for example 4165550142.</summary>
    public string? Phone { get; private set; }

    public CatalogueItem WithContact(string? contactName, string phone)
    {
        ContactName = contactName;
        Phone = phone;
        return this;
    }

    public CatalogueItem WithThemeProfile(ThemeProfile profile)
    {
        ThemeInfo = profile;
        return this;
    }

    public CatalogueItem WithVendorProfile(VendorProfile profile)
    {
        Vendor = profile;
        return this;
    }

    public CatalogueItem WithVenueProfile(VenueProfile profile)
    {
        Venue = profile;
        return this;
    }

    /// <summary>The slots still free on a date.</summary>
    public IReadOnlyList<VenueSlot> FreeSlotsOn(LocalDate date) =>
        Venue is null || !IsAvailableOn(date)
            ? []
            : Venue.Slots.Where(slot => !Venue.Booked.Any(b => b.Date == date && b.Start == slot.Start)).ToList();

    public bool HasFeature(string feature) => Features.Contains(feature, StringComparer.OrdinalIgnoreCase);

    public CatalogueItem WithFeatures(params string[] values)
    {
        Features = [.. Features, .. Lower(values)];
        return this;
    }

    public CatalogueItem FreeOf(params string[] allergens)
    {
        AllergyFree = [.. AllergyFree, .. Lower(allergens)];
        return this;
    }

    public CatalogueItem ForThemes(params string[] values)
    {
        Themes = [.. Themes, .. Lower(values)];
        return this;
    }

    public CatalogueItem UnavailableOn(params LocalDate[] dates)
    {
        UnavailableDates = [.. UnavailableDates, .. dates];
        return this;
    }

    public bool IsAvailableOn(LocalDate date) => !UnavailableDates.Contains(date);

    /// <summary>Whether the vendor declares it is free of the allergen a parent's note names.</summary>
    public bool IsFreeOf(string allergen) => AllergyFree.Contains(Allergens.Canonical(allergen), StringComparer.OrdinalIgnoreCase);

    public bool Fits(int guests) => Capacity is null || Capacity >= guests;

    private static IEnumerable<string> Lower(string[] values) => values.Select(v => v.ToLowerInvariant());

    /// <summary>
    /// Counts a party's star rating in the public rating, or replaces that party's earlier one.
    /// </summary>
    /// <param name="previous">The party's earlier rating; null for a first rating.</param>
    public void Rate(int stars, int? previous)
    {
        var (rating, count) = Venue is { } venue ? (venue.Rating, venue.ReviewCount) : Vendor is { } vendor ? (vendor.Rating, vendor.ReviewCount) : (0m, 0);
        var total = (rating * count) - (previous ?? 0) + stars;
        count += previous is null ? 1 : 0;
        rating = count == 0 ? 0 : total / count;
        if (Venue is not null)
        {
            (Venue.Rating, Venue.ReviewCount) = (rating, count);
        }
        else if (Vendor is not null)
        {
            (Vendor.Rating, Vendor.ReviewCount) = (rating, count);
        }
    }
}
