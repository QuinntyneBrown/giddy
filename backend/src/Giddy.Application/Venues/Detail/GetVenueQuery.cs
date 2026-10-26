using MediatR;

namespace Giddy.Application.Venues.Detail;

/// <param name="Date">ISO date to show slots for.</param>
public sealed record GetVenueQuery(Guid VenueId, string Date, Guid? PartyId) : IRequest<VenueDetail>;
