using Giddy.Domain.Wrapping;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class ProviderRatingConfiguration : IEntityTypeConfiguration<ProviderRating>
{
    public void Configure(EntityTypeBuilder<ProviderRating> builder)
    {
        builder.ToTable("ProviderRatings");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedNever();
        builder.Property(r => r.Review).HasMaxLength(500);
        builder.Ignore(r => r.IsNew);
        builder.HasIndex(r => new { r.PartyId, r.ProviderId }).IsUnique();
    }
}
