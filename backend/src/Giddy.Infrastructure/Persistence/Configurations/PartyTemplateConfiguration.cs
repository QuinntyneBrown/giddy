using Giddy.Domain.Wrapping;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class PartyTemplateConfiguration : IEntityTypeConfiguration<PartyTemplate>
{
    public void Configure(EntityTypeBuilder<PartyTemplate> builder)
    {
        builder.ToTable("PartyTemplates");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedNever();
        builder.Property(t => t.Name).HasMaxLength(120);
        builder.Property(t => t.ChildName).HasMaxLength(60);
        builder.Property(t => t.Theme).HasMaxLength(80);
        builder.OwnsMany(t => t.Bookings, bookings => bookings.ToJson());
        builder.OwnsMany(t => t.Tasks, tasks => tasks.ToJson());
        builder.HasIndex(t => t.SourcePartyId).IsUnique();
        builder.HasIndex(t => t.OwnerId);
    }
}
