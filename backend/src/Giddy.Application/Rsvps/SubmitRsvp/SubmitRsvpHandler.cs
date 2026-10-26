using Giddy.Application.Common;
using MediatR;
using NodaTime;

namespace Giddy.Application.Rsvps.SubmitRsvp;

/// <summary>Records the family's reply, replacing any earlier one, and adds a new allergy to the party's list.</summary>
public sealed class SubmitRsvpHandler(IGiddyDbContext db, RsvpLinks links, IClock clock) : IRequestHandler<SubmitRsvpCommand, RsvpView>
{
    public async Task<RsvpView> Handle(SubmitRsvpCommand request, CancellationToken cancellationToken)
    {
        var context = await links.ResolveAsync(request.Token, cancellationToken);
        if (!links.CanChange(context))
        {
            throw new ConflictException("The RSVP-by date has passed, so replies are closed. Contact the family directly.");
        }

        var (guest, party, _) = context;
        guest.Reply(request.Coming, request.Allergies, request.ParentStaying, request.Siblings, request.ParentName, request.Mobile, request.Note, clock.GetCurrentInstant());
        if (request.Coming && guest.Allergies is { } allergy)
        {
            party.NoteAllergy(allergy);
        }

        await db.SaveChangesAsync(cancellationToken);
        return await links.ViewAsync(context, cancellationToken);
    }
}
