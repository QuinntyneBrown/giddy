using Giddy.Application.Common;
using Giddy.Domain.Bookings;
using Giddy.Domain.Catalogue;
using Giddy.Domain.Conversations;
using Giddy.Domain.Disruptions;
using Giddy.Domain.Families;
using Giddy.Domain.Guests;
using Giddy.Domain.Invitations;
using Giddy.Domain.Live;
using Giddy.Domain.Memories;
using Giddy.Domain.Parents;
using Giddy.Domain.Parties;
using Giddy.Domain.Payments;
using Giddy.Domain.Proposals;
using Giddy.Domain.Vendors;
using Giddy.Infrastructure.Persistence.Conversions;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Infrastructure.Persistence;

public sealed class GiddyDbContext(DbContextOptions<GiddyDbContext> options) : DbContext(options), IGiddyDbContext
{
    public DbSet<Party> Parties => Set<Party>();

    public DbSet<CatalogueItem> CatalogueItems => Set<CatalogueItem>();

    public DbSet<Conversation> Conversations => Set<Conversation>();

    public DbSet<AgentTurn> AgentTurns => Set<AgentTurn>();

    public DbSet<Memory> Memories => Set<Memory>();

    public DbSet<Proposal> Proposals => Set<Proposal>();

    public DbSet<TurnLogEntry> TurnLogs => Set<TurnLogEntry>();

    public DbSet<Parent> Parents => Set<Parent>();

    public DbSet<Family> Families => Set<Family>();

    public DbSet<FavouriteVenue> FavouriteVenues => Set<FavouriteVenue>();

    public DbSet<VenueWaitlistEntry> VenueWaitlist => Set<VenueWaitlistEntry>();

    public DbSet<Booking> Bookings => Set<Booking>();

    public DbSet<SavedCard> SavedCards => Set<SavedCard>();

    public DbSet<DisruptionNotice> Disruptions => Set<DisruptionNotice>();

    public DbSet<Guest> Guests => Set<Guest>();

    public DbSet<Invitation> Invitations => Set<Invitation>();

    public DbSet<PartyEvent> PartyEvents => Set<PartyEvent>();

    public DbSet<QuoteRequest> QuoteRequests => Set<QuoteRequest>();

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<Instant>().HaveConversion<InstantConverter>();
        configurationBuilder.Properties<LocalDate>().HaveConversion<LocalDateConverter>();
        configurationBuilder.Properties<LocalTime>().HaveConversion<LocalTimeConverter>();
        configurationBuilder.Properties<decimal>().HavePrecision(10, 2);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GiddyDbContext).Assembly);
}
