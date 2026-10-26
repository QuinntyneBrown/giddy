using System.Text.Json;
using Giddy.Application.Accounts;
using Giddy.Application.Accounts.Sessions;
using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Parties;
using Giddy.Domain.Privacy;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;

namespace Giddy.Application.Privacy;

/// <summary>
/// A parent's own data: a machine-readable archive kept for a week, and deleting the account with
/// the parties it owns. Booking and payment records stay, as the law requires, without the parent.
/// </summary>
public sealed class PrivacyHandlers(
    IGiddyDbContext db, ICurrentParent current, IEmailSender email, IWebLinks links, ParentSessions sessions, TorontoCalendar calendar, IClock clock)
    : IRequestHandler<RequestExportCommand>,
      IRequestHandler<GetExportQuery, string>,
      IRequestHandler<GetDeletionCheckQuery, DeletionCheck>,
      IRequestHandler<DeleteAccountCommand>
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web) { WriteIndented = true };

    public async Task Handle(RequestExportCommand request, CancellationToken cancellationToken)
    {
        var parent = await db.Parents.SingleAsync(p => p.Id == current.Id, cancellationToken);
        var family = await db.Families.SingleOrDefaultAsync(f => f.Id == parent.Id, cancellationToken);
        var parties = await db.Parties.Where(p => p.Members.Any(m => m.ParentId == parent.Id)).ToListAsync(cancellationToken);
        var partyIds = parties.Select(p => p.Id).ToList();
        var guests = await db.Guests.Where(g => partyIds.Contains(g.PartyId)).ToListAsync(cancellationToken);
        var conversations = await db.Conversations.Where(c => c.ParentId == parent.Id).ToListAsync(cancellationToken);
        var notifications = await db.InboxItems.Where(i => i.ParentId == parent.Id).ToListAsync(cancellationToken);
        var archive = new
        {
            profile = new { firstName = parent.Name, lastName = parent.LastName, parent.Email, parent.Mobile, postalCode = family?.PostalCode, marketing = parent.MarketingOptIn },
            children = family?.Children.Select(c => new { c.FirstName, birthday = LocalDatePattern.Iso.Format(c.Birthday), c.Interests, c.Allergies }) ?? [],
            parties = parties.Select(p => new
            {
                p.Name,
                date = LocalDatePattern.Iso.Format(p.Date),
                role = p.Members.Single(m => m.ParentId == parent.Id).Role.ToString(),
                p.Theme,
                p.Budget,
                plan = p.BookingsToDo.Select(b => new { b.Category, b.Name, b.Estimate, status = b.Status.ToString() }),
                checklist = p.Checklist.Select(t => new { t.Title, due = LocalDatePattern.Iso.Format(t.Due), t.Done }),
                guests = guests.Where(g => g.PartyId == p.Id).Select(g => new { g.ChildName, g.ParentName, g.Email, g.Mobile, rsvp = g.Rsvp.ToString(), g.Allergies }),
            }),
            conversations = conversations.Select(c => new { startedAt = InstantPattern.General.Format(c.StartedAt), messages = c.Messages.Select(m => new { author = m.Author.ToString(), m.Text }) }),
            notifications = notifications.Select(n => new { n.Title, n.Detail, at = InstantPattern.General.Format(n.CreatedAt) }),
        };
        var export = new DataExport(parent.Id, JsonSerializer.Serialize(archive, Json), clock.GetCurrentInstant());
        db.DataExports.Add(export);
        await db.SaveChangesAsync(cancellationToken);
        await email.SendAsync(
            new EmailMessage(
                parent.Email,
                "Your Giddy data is ready",
                $"Hi {parent.Name},\n\nYour data is ready to download. Sign in, then open:\n{links.To($"/api/privacy/exports/{export.Id}")}\n\nThe link works for 7 days."),
            cancellationToken);
    }

    public async Task<string> Handle(GetExportQuery request, CancellationToken cancellationToken)
    {
        var export = await db.DataExports.SingleOrDefaultAsync(e => e.Id == request.ExportId && e.ParentId == current.Id, cancellationToken)
            ?? throw new NotFoundException("Export not found.");
        if (clock.GetCurrentInstant() >= export.ExpiresAt)
        {
            throw new LinkExpiredException("This download has expired. Ask for a new one from Settings.", null);
        }

        return export.Json;
    }

    public async Task<DeletionCheck> Handle(GetDeletionCheckQuery request, CancellationToken cancellationToken)
    {
        var today = calendar.Today;
        var owned = await OwnedPartiesAsync(cancellationToken);
        return new DeletionCheck(owned.Where(p => p.Date >= today).Sum(p => p.BookingsToDo.Count(b => b.Status == BookingStatus.Confirmed)));
    }

    public async Task Handle(DeleteAccountCommand request, CancellationToken cancellationToken)
    {
        var parentId = current.Id;
        var owned = await OwnedPartiesAsync(cancellationToken);
        var ownedIds = owned.Select(p => p.Id).ToList();
        db.Guests.RemoveRange(await db.Guests.IgnoreQueryFilters().Where(g => ownedIds.Contains(g.PartyId)).ToListAsync(cancellationToken));
        db.Invitations.RemoveRange(await db.Invitations.Where(i => ownedIds.Contains(i.PartyId)).ToListAsync(cancellationToken));
        db.PartyEvents.RemoveRange(await db.PartyEvents.Where(e => ownedIds.Contains(e.PartyId)).ToListAsync(cancellationToken));
        db.QuoteRequests.RemoveRange(await db.QuoteRequests.Where(q => ownedIds.Contains(q.PartyId)).ToListAsync(cancellationToken));
        db.PartyInvites.RemoveRange(await db.PartyInvites.Where(i => ownedIds.Contains(i.PartyId)).ToListAsync(cancellationToken));
        db.ThankYouNotes.RemoveRange(await db.ThankYouNotes.Where(n => ownedIds.Contains(n.PartyId)).ToListAsync(cancellationToken));
        db.ProviderRatings.RemoveRange(await db.ProviderRatings.Where(r => ownedIds.Contains(r.PartyId)).ToListAsync(cancellationToken));
        db.PartyTemplates.RemoveRange(await db.PartyTemplates.Where(t => t.OwnerId == parentId).ToListAsync(cancellationToken));
        db.Parties.RemoveRange(owned);
        foreach (var party in await db.Parties.Where(p => p.Members.Any(m => m.ParentId == parentId)).ToListAsync(cancellationToken))
        {
            party.RemoveMember(parentId);
        }

        var conversations = await db.Conversations.Where(c => c.ParentId == parentId).ToListAsync(cancellationToken);
        var conversationIds = conversations.Select(c => c.Id).ToList();
        db.AgentTurns.RemoveRange(await db.AgentTurns.Where(t => conversationIds.Contains(t.ConversationId)).ToListAsync(cancellationToken));
        db.TurnLogs.RemoveRange(await db.TurnLogs.Where(t => conversationIds.Contains(t.ConversationId)).ToListAsync(cancellationToken));
        db.Conversations.RemoveRange(conversations);
        db.Proposals.RemoveRange(await db.Proposals.Where(p => conversationIds.Contains(p.ConversationId) || ownedIds.Contains(p.PartyId)).ToListAsync(cancellationToken));
        db.FavouriteVenues.RemoveRange(await db.FavouriteVenues.Where(f => f.FamilyId == parentId).ToListAsync(cancellationToken));
        db.VenueWaitlist.RemoveRange(await db.VenueWaitlist.Where(w => w.FamilyId == parentId).ToListAsync(cancellationToken));
        db.Memories.RemoveRange(await db.Memories.Where(m => m.FamilyId == parentId).ToListAsync(cancellationToken));
        db.Families.RemoveRange(await db.Families.Where(f => f.Id == parentId).ToListAsync(cancellationToken));
        db.InboxItems.RemoveRange(await db.InboxItems.Where(i => i.ParentId == parentId).ToListAsync(cancellationToken));
        db.Notifications.RemoveRange(await db.Notifications.Where(n => n.ParentId == parentId).ToListAsync(cancellationToken));
        db.PushSubscriptions.RemoveRange(await db.PushSubscriptions.Where(s => s.ParentId == parentId).ToListAsync(cancellationToken));
        db.AccountTokens.RemoveRange(await db.AccountTokens.Where(t => t.ParentId == parentId).ToListAsync(cancellationToken));
        db.DataExports.RemoveRange(await db.DataExports.Where(e => e.ParentId == parentId).ToListAsync(cancellationToken));
        db.SavedCards.RemoveRange(await db.SavedCards.Where(c => c.ParentId == parentId).ToListAsync(cancellationToken));
        await sessions.EndAllAsync(parentId, cancellationToken);
        db.Parents.RemoveRange(await db.Parents.Where(p => p.Id == parentId).ToListAsync(cancellationToken));
        await db.SaveChangesAsync(cancellationToken);
    }

    private Task<List<Party>> OwnedPartiesAsync(CancellationToken cancellationToken) =>
        db.Parties.Where(p => p.Members.Any(m => m.ParentId == current.Id && m.Role == PartyRole.Owner)).ToListAsync(cancellationToken);
}
