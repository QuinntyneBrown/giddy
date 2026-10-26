using Giddy.Domain.Invitations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class InvitationConfiguration : IEntityTypeConfiguration<Invitation>
{
    public void Configure(EntityTypeBuilder<Invitation> builder)
    {
        builder.ToTable("Invitations");
        builder.HasKey(i => i.PartyId);
        builder.Property(i => i.PartyId).ValueGeneratedNever();
        builder.Property(i => i.Design).HasMaxLength(20);
        builder.Property(i => i.Headline).HasMaxLength(Invitation.HeadlineMaxLength);
        builder.Property(i => i.Message).HasMaxLength(Invitation.MessageMaxLength);
        builder.Ignore(i => i.AutomaticReminderOn);
    }
}
