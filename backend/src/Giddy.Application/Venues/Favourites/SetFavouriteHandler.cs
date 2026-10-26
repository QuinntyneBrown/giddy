using Giddy.Application.Common;
using Giddy.Domain.Catalogue;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Venues.Favourites;

/// <summary>Saves or removes a venue from the family's favourites.</summary>
public sealed class SetFavouriteHandler(IGiddyDbContext db, ICurrentParent parent) : IRequestHandler<SetFavouriteCommand>
{
    public async Task Handle(SetFavouriteCommand request, CancellationToken cancellationToken)
    {
        if (!await db.CatalogueItems.AnyAsync(i => i.Id == request.VenueId && i.Category == CatalogueCategory.Venue, cancellationToken))
        {
            throw new NotFoundException("Venue not found.");
        }

        var existing = await db.FavouriteVenues.SingleOrDefaultAsync(f => f.FamilyId == parent.Id && f.VenueId == request.VenueId, cancellationToken);
        if (request.Favourite && existing is null)
        {
            db.FavouriteVenues.Add(new FavouriteVenue(parent.Id, request.VenueId));
        }
        else if (!request.Favourite && existing is not null)
        {
            db.FavouriteVenues.Remove(existing);
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
