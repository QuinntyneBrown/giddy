namespace Giddy.Domain.Wrapping;

/// <summary>Giddy's wording for a thank-you note, in the birthday child's voice.</summary>
public static class ThankYouDrafts
{
    public static string For(string guestFirstName, string? gift, string fromChild) => gift is null
        ? $"Thank you so much for coming to my party, {guestFirstName}! It was so fun celebrating with you. Love, {fromChild}"
        : $"Thank you so much for the {gift}, {guestFirstName}! {fromChild} hasn’t put it down. It was so fun celebrating with you. Love, {fromChild}";
}
