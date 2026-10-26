using Giddy.Domain.Parties;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class PartyInviteConfiguration : IEntityTypeConfiguration<PartyInvite>
{
    public void Configure(EntityTypeBuilder<PartyInvite> builder)
    {
        builder.ToTable("PartyInvites");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();
        builder.Property(i => i.Email).HasMaxLength(254);
        builder.Property(i => i.TokenHash).HasMaxLength(64);
        builder.Property(i => i.Role).HasConversion<string>().HasMaxLength(20);
        builder.HasIndex(i => i.TokenHash).IsUnique();
        builder.HasIndex(i => i.PartyId);
    }
}
