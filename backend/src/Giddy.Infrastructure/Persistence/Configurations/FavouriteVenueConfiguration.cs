using Giddy.Domain.Catalogue;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class FavouriteVenueConfiguration : IEntityTypeConfiguration<FavouriteVenue>
{
    public void Configure(EntityTypeBuilder<FavouriteVenue> builder)
    {
        builder.ToTable("FavouriteVenues");
        builder.HasKey(f => new { f.FamilyId, f.VenueId });
    }
}
