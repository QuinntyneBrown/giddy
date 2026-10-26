using MediatR;

namespace Giddy.Application.Venues.Compare;

public sealed record CompareVenuesQuery(IReadOnlyList<Guid> VenueIds, string Date, Guid? PartyId) : IRequest<VenueComparison>;
