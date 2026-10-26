using Giddy.Domain.Payments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class SavedCardConfiguration : IEntityTypeConfiguration<SavedCard>
{
    public void Configure(EntityTypeBuilder<SavedCard> builder)
    {
        builder.ToTable("SavedCards");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedNever();
        builder.Property(c => c.ProviderToken).HasMaxLength(120);
        builder.Property(c => c.Brand).HasMaxLength(20);
        builder.Property(c => c.Last4).HasMaxLength(4);
        builder.HasIndex(c => c.ParentId);
    }
}
