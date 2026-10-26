using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Places;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Families;

public sealed class GetFamilyHandler(IGiddyDbContext db, ICurrentParent parent, TorontoCalendar calendar) : IRequestHandler<GetFamilyQuery, FamilyView>
{
    public async Task<FamilyView> Handle(GetFamilyQuery request, CancellationToken cancellationToken)
    {
        var family = await db.Families.SingleOrDefaultAsync(f => f.Id == parent.Id, cancellationToken);
        if (family is null)
        {
            return new FamilyView(null, null, []);
        }

        var today = calendar.Today;
        var parties = await db.Parties.Where(p => p.Members.Any(m => m.ParentId == parent.Id)).ToListAsync(cancellationToken);
        var area = PostalCode.TryParse(family.PostalCode, out var code) ? GtaAreas.Resolve(code!).Name : null;
        return new FamilyView(
            family.PostalCode.Length > 0 ? family.PostalCode : null,
            area,
            family.Children
                .OrderBy(c => c.NextBirthday(today))
                .Select(c => ChildViews.For(c, parties, calendar))
                .ToList());
    }
}
