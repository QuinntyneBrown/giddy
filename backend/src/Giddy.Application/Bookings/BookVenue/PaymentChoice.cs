namespace Giddy.Application.Bookings.BookVenue;

/// <summary>A new card's provider token, or one of the family's saved cards.</summary>
public sealed record PaymentChoice(string? Token, Guid? SavedCardId = null, bool SaveCard = false);
