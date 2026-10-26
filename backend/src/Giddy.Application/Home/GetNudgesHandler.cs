using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Home;
using MediatR;

namespace Giddy.Application.Home;

public sealed class GetNudgesHandler(IGiddyDbContext db, ICurrentParent parent, TorontoCalendar calendar)
    : IRequestHandler<GetNudgesQuery, IReadOnlyList<NudgeView>>
{
    public async Task<IReadOnlyList<NudgeView>> Handle(GetNudgesQuery request, CancellationToken cancellationToken)
    {
        var parties = await MyParties.LoadAsync(db, parent.Id, cancellationToken);
        return NudgeEngine.For(parties, calendar.Today)
            .Select(n => new NudgeView(n.PartyId, n.PartyName, n.Title, n.Kind, n.Context, n.ActionLabel))
            .ToList();
    }
}
