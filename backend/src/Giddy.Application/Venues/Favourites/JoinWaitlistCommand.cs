using MediatR;

namespace Giddy.Application.Venues.Favourites;

/// <summary>"Tell me if a slot opens" for a venue on a date.</summary>
public sealed record JoinWaitlistCommand(Guid VenueId, string Date, Guid? PartyId) : IRequest;
