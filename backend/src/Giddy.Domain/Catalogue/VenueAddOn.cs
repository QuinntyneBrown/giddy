namespace Giddy.Domain.Catalogue;

/// <param name="Price">Description of the price, for example "+$40" or "$14 per pizza".</param>
public sealed record VenueAddOn(string Name, string Price);
