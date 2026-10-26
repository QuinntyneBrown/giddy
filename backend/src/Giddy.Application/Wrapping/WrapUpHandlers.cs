using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using Giddy.Domain.Wrapping;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;
using NodaTime.Text;

namespace Giddy.Application.Wrapping;

/// <summary>
/// After the party: a thank-you note per guest who came, ratings of the businesses the party
/// booked, the final numbers, and saving the plan to start next year's party from.
/// </summary>
public sealed class WrapUpHandlers(IGiddyDbContext db, ICurrentParent current, IEmailSender email, TorontoCalendar calendar, IClock clock)
    : IRequestHandler<GetWrapUpQuery, WrapUpView>,
      IRequestHandler<SaveThankYouCommand>,
      IRequestHandler<SendThankYousCommand, ThankYousSent>,
      IRequestHandler<RateProviderCommand, ProviderView>,
      IRequestHandler<SaveTemplateCommand, SavedTemplate>,
      IRequestHandler<GetTemplateQuery, TemplateSummary>
{
    public async Task<WrapUpView> Handle(GetWrapUpQuery request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var guests = await db.Guests.Where(g => g.PartyId == party.Id).ToListAsync(cancellationToken);
        var notes = await db.ThankYouNotes.Where(n => n.PartyId == party.Id).ToDictionaryAsync(n => n.GuestId, cancellationToken);
        var ratings = await db.ProviderRatings.Where(r => r.PartyId == party.Id).ToDictionaryAsync(r => r.ProviderId, cancellationToken);
        var template = await db.PartyTemplates.SingleOrDefaultAsync(t => t.SourcePartyId == party.Id, cancellationToken);
        var open = party.IsLockedOn(calendar.Today);
        var came = Came(guests).ToList();
        return new WrapUpView(
            open,
            LocalDatePattern.Iso.Format(party.Date.PlusDays(1)),
            party.ChildName,
            open ? came.Select(g => Note(party, g, notes.GetValueOrDefault(g.Id))).ToList() : [],
            open ? Booked(party).Select(b => Provider(b, ratings.GetValueOrDefault(b.CatalogueItemId!.Value))).ToList() : [],
            new FinalNumbers(
                came.Count,
                guests.Count(g => g.Rsvp != RsvpStatus.NotSent),
                party.BookingsToDo.Sum(b => b.Estimate) + party.Expenses.Sum(e => e.Amount),
                party.Budget,
                came.Count(g => notes.GetValueOrDefault(g.Id)?.Gift is not null)),
            template is null ? null : View(template));
    }

    public async Task Handle(SaveThankYouCommand request, CancellationToken cancellationToken)
    {
        await OpenPartyAsync(request.PartyId, cancellationToken);
        var guest = await db.Guests.SingleOrDefaultAsync(g => g.Id == request.GuestId && g.PartyId == request.PartyId && g.Rsvp == RsvpStatus.Coming, cancellationToken)
            ?? throw new NotFoundException("Guest not found.");
        var note = await NoteAsync(request.PartyId, guest.Id, cancellationToken);
        note.Edit(request.Gift, request.Message);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<ThankYousSent> Handle(SendThankYousCommand request, CancellationToken cancellationToken)
    {
        var party = await OpenPartyAsync(request.PartyId, cancellationToken);
        var guests = await db.Guests.Where(g => g.PartyId == party.Id).ToListAsync(cancellationToken);
        var sender = await db.Parents.Where(p => p.Id == current.Id).Select(p => p.Name).SingleOrDefaultAsync(cancellationToken) ?? current.Name;
        var sent = 0;
        foreach (var guest in Came(guests).Where(g => g.Email is not null))
        {
            var note = await NoteAsync(party.Id, guest.Id, cancellationToken);
            if (note.SentAt is not null)
            {
                continue;
            }

            await email.SendAsync(
                new EmailMessage(
                    guest.Email!,
                    $"A thank-you from {From(party)}",
                    $"Hi {guest.ParentName},\n\n{Message(party, guest, note)}\n\nSent by {sender} with Giddy."),
                cancellationToken);
            note.MarkSent(clock.GetCurrentInstant());
            await db.SaveChangesAsync(cancellationToken);
            sent++;
        }

        return new ThankYousSent(sent);
    }

    public async Task<ProviderView> Handle(RateProviderCommand request, CancellationToken cancellationToken)
    {
        var party = await OpenPartyAsync(request.PartyId, cancellationToken);
        var booking = Booked(party).SingleOrDefault(b => b.CatalogueItemId == request.ProviderId)
            ?? throw new NotFoundException("Only venues and vendors this party booked can be rated.");
        var item = await db.CatalogueItems.SingleAsync(i => i.Id == request.ProviderId, cancellationToken);
        var rating = await db.ProviderRatings.SingleOrDefaultAsync(r => r.PartyId == party.Id && r.ProviderId == request.ProviderId, cancellationToken);
        if (rating is null)
        {
            rating = new ProviderRating(party.Id, request.ProviderId);
            db.ProviderRatings.Add(rating);
        }

        item.Rate(request.Stars, rating.IsNew ? null : rating.Stars);
        rating.Rate(request.Stars, request.Review, current.Id, clock.GetCurrentInstant());
        await db.SaveChangesAsync(cancellationToken);
        return Provider(booking, rating);
    }

    public async Task<SavedTemplate> Handle(SaveTemplateCommand request, CancellationToken cancellationToken)
    {
        var party = await OpenPartyAsync(request.PartyId, cancellationToken);
        var existing = await db.PartyTemplates.SingleOrDefaultAsync(t => t.SourcePartyId == party.Id, cancellationToken);
        if (existing is not null)
        {
            return new SavedTemplate(View(existing), false);
        }

        var template = new PartyTemplate(party, await RemindOnAsync(party, cancellationToken), clock.GetCurrentInstant());
        db.PartyTemplates.Add(template);
        await db.SaveChangesAsync(cancellationToken);
        return new SavedTemplate(View(template), true);
    }

    public async Task<TemplateSummary> Handle(GetTemplateQuery request, CancellationToken cancellationToken)
    {
        var template = await db.PartyTemplates.SingleOrDefaultAsync(t => t.Id == request.TemplateId && t.OwnerId == current.Id, cancellationToken)
            ?? throw new NotFoundException("Saved plan not found.");
        return new TemplateSummary(template.Id, template.Name, template.ChildId, template.ChildName, template.Theme);
    }

    private static IEnumerable<Guest> Came(IEnumerable<Guest> guests) =>
        guests.Where(g => g.Rsvp == RsvpStatus.Coming).OrderBy(g => g.ChildName, StringComparer.Ordinal);

    private static IEnumerable<BookingToDo> Booked(Party party) =>
        party.BookingsToDo.Where(b => b.Status == BookingStatus.Confirmed && b.CatalogueItemId is not null);

    private static string From(Party party) => party.ChildName ?? "us";

    private static string Message(Party party, Guest guest, ThankYouNote? note) =>
        note?.Message ?? ThankYouDrafts.For(guest.ChildFirstName, note?.Gift, From(party));

    private static ThankYouNoteView Note(Party party, Guest guest, ThankYouNote? note) => new(
        guest.Id,
        guest.ChildName,
        guest.ParentName,
        note?.Gift,
        Message(party, guest, note),
        note?.SentAt is null ? "draft" : "sent",
        guest.Email is not null);

    private static ProviderView Provider(BookingToDo booking, ProviderRating? rating) =>
        new(booking.CatalogueItemId!.Value, booking.Name, booking.Category, rating?.IsNew == false ? rating.Stars : null, rating?.Review);

    private static TemplateView View(PartyTemplate template) =>
        new(template.Id, template.RemindOn is { } date ? LocalDatePattern.Iso.Format(date) : null);

    /// <summary>Wrap-up changes are only for a party that has happened.</summary>
    private async Task<Party> OpenPartyAsync(Guid partyId, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == partyId, cancellationToken);
        return party.IsLockedOn(calendar.Today)
            ? party
            : throw new ConflictException("Wrap-up opens the day after the party.");
    }

    private async Task<ThankYouNote> NoteAsync(Guid partyId, Guid guestId, CancellationToken cancellationToken)
    {
        var note = await db.ThankYouNotes.SingleOrDefaultAsync(n => n.PartyId == partyId && n.GuestId == guestId, cancellationToken);
        if (note is null)
        {
            note = new ThankYouNote(partyId, guestId);
            db.ThankYouNotes.Add(note);
        }

        return note;
    }

    /// <summary>Eight weeks before the birthday after the one this party celebrated.</summary>
    private async Task<LocalDate?> RemindOnAsync(Party party, CancellationToken cancellationToken)
    {
        if (party.ChildId is not { } childId || party.TurningAge is not { } age)
        {
            return null;
        }

        var family = await db.Families.SingleOrDefaultAsync(f => f.Id == party.OwnerId, cancellationToken);
        var child = family?.Children.SingleOrDefault(c => c.Id == childId);
        return child?.Birthday.PlusYears(age + 1).PlusDays(-PartyTemplate.RemindDaysBefore);
    }
}
