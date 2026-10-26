using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NodaTime;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class PartyConfiguration : IEntityTypeConfiguration<Party>
{
    public void Configure(EntityTypeBuilder<Party> builder)
    {
        builder.ToTable("Parties");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();
        builder.Property(p => p.Name).HasMaxLength(Party.NameMaxLength).IsRequired();
        builder.Property(p => p.Date).HasConversion(d => d.ToDateOnly(), d => LocalDate.FromDateOnly(d));
        builder.Property(p => p.StartsAt).HasConversion(t => t.ToTimeOnly(), t => LocalTime.FromTimeOnly(t));
        builder.Property(p => p.EndsAt).HasConversion(t => t.ToTimeOnly(), t => LocalTime.FromTimeOnly(t));
        builder.OwnsMany(p => p.Members, members =>
        {
            members.ToTable("PartyMembers");
            members.WithOwner().HasForeignKey("PartyId");
            members.HasKey("PartyId", nameof(PartyMember.ParentId));
            members.Property(m => m.Role).HasConversion<string>().HasMaxLength(20);
            members.HasIndex(m => m.ParentId);
        });
        builder.Navigation(p => p.Members).HasField("members").UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
