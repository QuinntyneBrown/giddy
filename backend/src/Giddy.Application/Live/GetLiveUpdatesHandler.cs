using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Live;

public sealed class GetLiveUpdatesHandler(IGiddyDbContext db, ICurrentParent parent) : IRequestHandler<GetLiveUpdatesQuery, LiveUpdates>
{
    private const int PageSize = 50;

    public async Task<LiveUpdates> Handle(GetLiveUpdatesQuery request, CancellationToken cancellationToken)
    {
        var parties = db.Parties.Where(p => p.Members.Any(m => m.ParentId == parent.Id)).Select(p => p.Id);
        var mine = db.PartyEvents.Where(e => parties.Contains(e.PartyId) && e.ActorParentId != parent.Id);
        if (request.After is not { } after)
        {
            var latest = await db.PartyEvents.Select(e => (long?)e.Id).MaxAsync(cancellationToken) ?? 0;
            return new LiveUpdates([], latest);
        }

        var events = await mine.Where(e => e.Id > after).OrderBy(e => e.Id).Take(PageSize).ToListAsync(cancellationToken);
        return new LiveUpdates(
            events.Select(e => new LiveUpdate(
                e.Id, e.PartyId, e.GuestId, e.Kind, e.Tone, e.Title, e.Text,
                e.ActionLabel is { } label && e.ActionKind is { } kind ? new LiveUpdateAction(label, kind) : null)).ToList(),
            events.Count > 0 ? events[^1].Id : after);
    }
}
