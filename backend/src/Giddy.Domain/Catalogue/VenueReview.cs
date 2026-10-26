namespace Giddy.Domain.Catalogue;

/// <summary>A parent's review. The text is third-party content.</summary>
public sealed record VenueReview(string Author, string Occasion, string When, int Rating, string Text);
