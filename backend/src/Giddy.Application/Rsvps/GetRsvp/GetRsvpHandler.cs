using Giddy.Application.Common;
using Giddy.Application.Live;
using MediatR;
using NodaTime;

namespace Giddy.Application.Rsvps.GetRsvp;

public sealed class GetRsvpHandler(IGiddyDbContext db, RsvpLinks links, IClock clock) : IRequestHandler<GetRsvpQuery, RsvpView>
{
    public async Task<RsvpView> Handle(GetRsvpQuery request, CancellationToken cancellationToken)
    {
        var context = await links.ResolveAsync(request.Token, cancellationToken);
        var now = clock.GetCurrentInstant();
        if (context.Guest.RecordOpen(now))
        {
            db.PartyEvents.Add(PartyEvents.Opened(context.Guest, now));
            await db.SaveChangesAsync(cancellationToken);
        }

        return await links.ViewAsync(context, cancellationToken);
    }
}
