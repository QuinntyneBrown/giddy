using Giddy.Domain.Wrapping;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class ThankYouNoteConfiguration : IEntityTypeConfiguration<ThankYouNote>
{
    public void Configure(EntityTypeBuilder<ThankYouNote> builder)
    {
        builder.ToTable("ThankYouNotes");
        builder.HasKey(n => n.Id);
        builder.Property(n => n.Id).ValueGeneratedNever();
        builder.Property(n => n.Gift).HasMaxLength(120);
        builder.Property(n => n.Message).HasMaxLength(1000);
        builder.HasIndex(n => new { n.PartyId, n.GuestId }).IsUnique();
    }
}
