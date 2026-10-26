using Giddy.Domain.Catalogue;
using Giddy.Infrastructure.Persistence.Conversions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class CatalogueItemConfiguration : IEntityTypeConfiguration<CatalogueItem>
{
    public void Configure(EntityTypeBuilder<CatalogueItem> builder)
    {
        builder.ToTable("CatalogueItems");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();
        builder.Property(i => i.Category).HasConversion<string>().HasMaxLength(20);
        builder.Property(i => i.Name).HasMaxLength(120);
        builder.Property(i => i.Neighbourhood).HasMaxLength(80);
        builder.Property(i => i.PriceBasis).HasMaxLength(120);
        builder.PrimitiveCollection(i => i.Features);
        builder.PrimitiveCollection(i => i.AllergyFree);
        builder.PrimitiveCollection(i => i.Themes);
        builder.Property(i => i.UnavailableDates)
            .HasConversion(new LocalDateArrayConverter(), LocalDateArrayConverter.Comparer);
        builder.OwnsOne(i => i.Venue, venue =>
        {
            venue.ToJson();
            venue.OwnsMany(v => v.Slots);
            venue.OwnsMany(v => v.Booked);
            venue.OwnsMany(v => v.AddOns);
            venue.OwnsMany(v => v.Reviews);
        });
        builder.OwnsOne(i => i.Vendor, vendor => vendor.ToJson());
        builder.OwnsOne(i => i.ThemeInfo, theme => theme.ToJson());
        builder.HasIndex(i => i.Category);
    }
}
