using Giddy.Domain.Guests;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class GuestConfiguration : IEntityTypeConfiguration<Guest>
{
    public void Configure(EntityTypeBuilder<Guest> builder)
    {
        builder.ToTable("Guests");
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).ValueGeneratedNever();
        builder.Property(g => g.ChildName).HasMaxLength(80);
        builder.Property(g => g.ParentName).HasMaxLength(80);
        builder.Property(g => g.Email).HasMaxLength(254);
        builder.Property(g => g.Mobile).HasMaxLength(20);
        builder.Property(g => g.Rsvp).HasConversion<string>().HasMaxLength(20);
        builder.Property(g => g.Allergies).HasMaxLength(200);
        builder.Property(g => g.Note).HasMaxLength(500);
        builder.Property(g => g.TokenHash).HasMaxLength(64);
        builder.Ignore(g => g.ChildFirstName);
        builder.Ignore(g => g.FamilyName);
        builder.Ignore(g => g.HasAllergies);
        builder.HasIndex(g => g.PartyId);
        builder.HasIndex(g => g.TokenHash).IsUnique().HasFilter("[TokenHash] IS NOT NULL");
    }
}
