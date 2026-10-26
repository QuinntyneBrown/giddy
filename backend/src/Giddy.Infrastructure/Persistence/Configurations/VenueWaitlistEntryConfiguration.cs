using Giddy.Domain.Catalogue;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class VenueWaitlistEntryConfiguration : IEntityTypeConfiguration<VenueWaitlistEntry>
{
    public void Configure(EntityTypeBuilder<VenueWaitlistEntry> builder)
    {
        builder.ToTable("VenueWaitlist");
        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).ValueGeneratedNever();
        builder.HasIndex(w => new { w.VenueId, w.Date });
    }
}
