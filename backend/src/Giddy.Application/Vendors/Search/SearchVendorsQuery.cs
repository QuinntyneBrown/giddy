using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Vendors.Search;

/// <param name="Category">entertainers, activities, food or rentals.</param>
/// <param name="Theme">"off" turns the party's theme filter off.</param>
public sealed record SearchVendorsQuery(Guid PartyId, string Category, string? Theme, decimal? MaxPrice) : IRequest<VendorSearchResult>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Read;
}
