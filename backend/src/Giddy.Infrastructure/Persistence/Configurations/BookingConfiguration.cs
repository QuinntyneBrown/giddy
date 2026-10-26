using Giddy.Domain.Bookings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Giddy.Infrastructure.Persistence.Configurations;

public sealed class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("Bookings");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).ValueGeneratedNever();
        builder.Property(b => b.VenueName).HasMaxLength(120);
        builder.Property(b => b.Room).HasMaxLength(80);
        builder.Property(b => b.State).HasConversion<string>().HasMaxLength(20);
        builder.Property(b => b.HoldReference).HasMaxLength(120);
        builder.Property(b => b.PaymentId).HasMaxLength(120);
        builder.Property(b => b.CardBrand).HasMaxLength(20);
        builder.Property(b => b.CardLast4).HasMaxLength(4);
        builder.Property(b => b.ChallengeUrl).HasMaxLength(500);
        builder.Property(b => b.ConfirmationNumber).HasMaxLength(40);
        builder.Property(b => b.BookingName).HasMaxLength(80);
        builder.Property(b => b.Mobile).HasMaxLength(20);
        builder.Property(b => b.Child).HasMaxLength(80);
        builder.Property(b => b.Notes).HasMaxLength(500);
        builder.Ignore(b => b.Balance);
        builder.HasIndex(b => b.PartyId);
    }
}
