using Giddy.Domain.Notifications;
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
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Common;

public interface IGiddyDbContext
{
    DbSet<Party> Parties { get; }

    DbSet<CatalogueItem> CatalogueItems { get; }

    DbSet<Conversation> Conversations { get; }

    DbSet<AgentTurn> AgentTurns { get; }

    DbSet<Memory> Memories { get; }

    DbSet<Proposal> Proposals { get; }

    DbSet<TurnLogEntry> TurnLogs { get; }

    DbSet<Parent> Parents { get; }

    DbSet<Family> Families { get; }

    DbSet<FavouriteVenue> FavouriteVenues { get; }

    DbSet<VenueWaitlistEntry> VenueWaitlist { get; }

    DbSet<Booking> Bookings { get; }

    DbSet<SavedCard> SavedCards { get; }

    DbSet<DisruptionNotice> Disruptions { get; }

    DbSet<Guest> Guests { get; }

    DbSet<Invitation> Invitations { get; }

    DbSet<PartyEvent> PartyEvents { get; }

    DbSet<QuoteRequest> QuoteRequests { get; }

    DbSet<ScheduledNotification> Notifications { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
