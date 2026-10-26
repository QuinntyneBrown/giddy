using Giddy.Application.Accounts;
using Giddy.Application.Common;
using Giddy.Application.Parties;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;

namespace Giddy.Application.Sharing;

/// <summary>
/// Planning together: invitations by email with a role, the planners and pending invitations,
/// removing a planner (never the owner), and the read-only link.
/// </summary>
public sealed class SharingHandlers(IGiddyDbContext db, ICurrentParent current, IEmailSender email, IWebLinks links, IClock clock)
    : IRequestHandler<InviteMemberCommand>,
      IRequestHandler<GetMembersQuery, MembersView>,
      IRequestHandler<RemoveMemberCommand>,
      IRequestHandler<JoinPartyCommand, Joined>,
      IRequestHandler<CreateShareLinkCommand, ShareLink>,
      IRequestHandler<GetSharedSummaryQuery, SharedSummary>
{
    private static readonly LocalTimePattern Time = LocalTimePattern.CreateWithInvariantCulture("HH:mm");

    public async Task Handle(InviteMemberCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var address = EmailAddresses.Normalize(request.Email);
        var token = TokenHashes.NewToken();
        db.PartyInvites.Add(new PartyInvite(party.Id, address, request.Role, TokenHashes.Of(token), current.Id, clock.GetCurrentInstant()));
        await db.SaveChangesAsync(cancellationToken);
        var inviter = await db.Parents.Where(p => p.Id == current.Id).Select(p => p.Name).SingleOrDefaultAsync(cancellationToken) ?? current.Name;
        var what = request.Role == PartyRole.Viewer ? "follow along with" : "plan";
        await email.SendAsync(
            new EmailMessage(
                address,
                $"{inviter} invited you to {what} {party.Name}",
                $"{inviter} would like you to {what} {party.Name} on Giddy.\n\nAccept here (you’ll sign in or create a free account first):\n{links.To($"/join/{token}")}\n\nThe invitation works for 14 days."),
            cancellationToken);
    }

    public async Task<MembersView> Handle(GetMembersQuery request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var ids = party.Members.Select(m => m.ParentId).ToList();
        var names = await db.Parents.Where(p => ids.Contains(p.Id)).ToDictionaryAsync(p => p.Id, p => p.FullName, cancellationToken);
        var now = clock.GetCurrentInstant();
        var invited = await db.PartyInvites.Where(i => i.PartyId == party.Id && i.AcceptedAt == null).ToListAsync(cancellationToken);
        return new MembersView(
            party.Members
                .OrderBy(m => m.Role)
                .Select(m => new MemberView(m.ParentId, names.GetValueOrDefault(m.ParentId, "A planner"), m.Role, m.ParentId == current.Id))
                .ToList(),
            invited.Where(i => i.IsOpenAt(now)).OrderBy(i => i.CreatedAt).Select(i => new InvitedView(i.Email, i.Role)).ToList());
    }

    public async Task Handle(RemoveMemberCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        if (party.OwnerId == request.ParentId)
        {
            throw new ForbiddenException("The party’s owner can’t be removed.");
        }

        if (!party.RemoveMember(request.ParentId))
        {
            throw new NotFoundException("That person isn’t planning this party.");
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<Joined> Handle(JoinPartyCommand request, CancellationToken cancellationToken)
    {
        var hash = TokenHashes.Of(request.Token);
        var invite = await db.PartyInvites.SingleOrDefaultAsync(i => i.TokenHash == hash, cancellationToken);
        var now = clock.GetCurrentInstant();
        if (invite is null || !invite.IsOpenAt(now))
        {
            throw new LinkExpiredException("This invitation has expired. Ask for a new one.", null);
        }

        var party = await db.Parties.SingleAsync(p => p.Id == invite.PartyId, cancellationToken);
        if (party.Members.All(m => m.ParentId != current.Id))
        {
            party.Share(current.Id, invite.Role);
            var name = await db.Parents.Where(p => p.Id == current.Id).Select(p => p.FullName).SingleOrDefaultAsync(cancellationToken) ?? current.Name;
            db.InboxItems.Add(new Giddy.Domain.Notifications.InboxItem(
                invite.InvitedBy,
                "👋",
                $"{name} joined your plan",
                invite.Role == PartyRole.Viewer ? $"They can now follow {party.Name}." : $"They can now edit {party.Name} with you.",
                $"/parties/{party.Id}",
                now));
        }

        invite.Accept(now);
        await db.SaveChangesAsync(cancellationToken);
        return new Joined(party.Id, party.Name);
    }

    public async Task<ShareLink> Handle(CreateShareLinkCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var token = TokenHashes.NewToken();
        party.SetShareLink(TokenHashes.Of(token));
        await db.SaveChangesAsync(cancellationToken);
        return new ShareLink(token, $"/shared/{token}");
    }

    public async Task<SharedSummary> Handle(GetSharedSummaryQuery request, CancellationToken cancellationToken)
    {
        var hash = TokenHashes.Of(request.Token ?? string.Empty);
        var party = await db.Parties.SingleOrDefaultAsync(p => p.ShareLinkHash == hash, cancellationToken)
            ?? throw new NotFoundException("This link doesn’t work any more.");
        var coming = await db.Guests.CountAsync(g => g.PartyId == party.Id && g.Rsvp == RsvpStatus.Coming, cancellationToken);
        return new SharedSummary(
            party.Name,
            party.ChildName,
            PartySummaryMapper.DatePattern.Format(party.Date),
            Time.Format(party.StartsAt),
            Time.Format(party.EndsAt),
            party.Theme,
            party.BookingsToDo.FirstOrDefault(b => b.Category == "Venue" && b.Status == BookingStatus.Confirmed)?.Name,
            coming,
            party.BookingsToDo.Select(b => $"{b.Category}: {b.Name}").ToList());
    }
}
