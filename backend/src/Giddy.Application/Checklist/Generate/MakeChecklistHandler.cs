using Giddy.Application.Checklist.View;
using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Checklist.Generate;

public sealed class MakeChecklistHandler(IGiddyDbContext db, ChecklistProjection projection, TorontoCalendar calendar)
    : IRequestHandler<MakeChecklistCommand, ChecklistView>
{
    public async Task<ChecklistView> Handle(MakeChecklistCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        if (party.Checklist.Count > 0)
        {
            throw new ConflictException("This party already has a checklist.");
        }

        party.MakeChecklist(ChecklistGenerator.For(party.Date, calendar.Today));
        await db.SaveChangesAsync(cancellationToken);
        return await projection.ViewAsync(party, cancellationToken);
    }
}
