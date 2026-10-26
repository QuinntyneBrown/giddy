using MediatR;

namespace Giddy.Application.Venues.Favourites;

public sealed record SetFavouriteCommand(Guid VenueId, bool Favourite) : IRequest;
