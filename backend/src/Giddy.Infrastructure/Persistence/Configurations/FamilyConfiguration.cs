using Giddy.Domain.Families;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class FamilyConfiguration : IEntityTypeConfiguration<Family>
{
    public void Configure(EntityTypeBuilder<Family> builder)
    {
        builder.ToTable("Families");
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).ValueGeneratedNever();
        builder.Property(f => f.PostalCode).HasMaxLength(7);
        builder.OwnsMany(f => f.Children, children =>
        {
            children.ToJson();
            children.Property(c => c.Id).ValueGeneratedNever();
        });
    }
}
