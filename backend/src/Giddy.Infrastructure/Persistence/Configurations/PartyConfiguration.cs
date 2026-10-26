using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class PartyConfiguration : IEntityTypeConfiguration<Party>
{
    public void Configure(EntityTypeBuilder<Party> builder)
    {
        builder.ToTable("Parties");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();
        builder.Property(p => p.Name).HasMaxLength(Party.NameMaxLength).IsRequired();
        builder.Property(p => p.ChildName).HasMaxLength(40);
        builder.Property(p => p.Theme).HasMaxLength(80);
        builder.Property(p => p.AllergyUpdateFor).HasMaxLength(40);
        builder.PrimitiveCollection(p => p.Allergies);
        builder.OwnsOne(p => p.Area, area =>
        {
            area.Property(a => a.Name).HasMaxLength(80);
        });
        builder.OwnsMany(p => p.Members, members =>
        {
            members.ToTable("PartyMembers");
            members.WithOwner().HasForeignKey("PartyId");
            members.HasKey("PartyId", nameof(PartyMember.ParentId));
            members.Property(m => m.Role).HasConversion<string>().HasMaxLength(20);
            members.HasIndex(m => m.ParentId);
        });
        builder.Navigation(p => p.Members).HasField("members").UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.OwnsMany(p => p.BookingsToDo, bookings =>
        {
            bookings.ToJson();
            bookings.Property(b => b.Status).HasConversion<string>();
        });
        builder.OwnsMany(p => p.Checklist, tasks => tasks.ToJson());
    }
}
