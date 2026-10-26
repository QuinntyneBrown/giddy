using Giddy.Application.Common;
using Giddy.Application.Parties;
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
        var area = PostalCode.TryParse(family.PostalCode, out var code) ? GtaAreas.Resolve(code!).Name : null;
        return new FamilyView(
            family.PostalCode,
            area,
            family.Children
                .OrderBy(c => c.NextBirthday(today))
                .Select(c => new ChildView(
                    c.Id,
                    c.FirstName,
                    PartySummaryMapper.DatePattern.Format(c.Birthday),
                    PartySummaryMapper.DatePattern.Format(c.NextBirthday(today)),
                    c.TurningAge(today)))
                .ToList());
    }
}
