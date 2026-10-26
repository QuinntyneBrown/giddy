using Giddy.Application.Common;
using Giddy.Domain.Calendar;
using Giddy.Domain.Families;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Families.Children;

/// <summary>Adds or changes a child in the signed-in parent's own family.</summary>
public sealed class SaveChildHandler(IGiddyDbContext db, ICurrentParent parent, TorontoCalendar calendar) : IRequestHandler<SaveChildCommand, ChildView>
{
    public async Task<ChildView> Handle(SaveChildCommand request, CancellationToken cancellationToken)
    {
        var family = await db.Families.SingleOrDefaultAsync(f => f.Id == parent.Id, cancellationToken);
        if (family is null)
        {
            family = new Family(parent.Id, string.Empty);
            db.Families.Add(family);
        }

        var child = new Child(request.ChildId ?? Guid.NewGuid(), request.FirstName.Trim(), LocalDatePattern.Iso.Parse(request.Birthday).Value)
        {
            Interests = request.Interests.Distinct().ToArray(),
            Allergies = string.IsNullOrWhiteSpace(request.Allergies) ? null : request.Allergies.Trim(),
        };
        if (request.ChildId is null)
        {
            family.AddChild(child);
        }
        else if (!family.UpdateChild(child))
        {
            throw new NotFoundException("Child not found.");
        }

        await db.SaveChangesAsync(cancellationToken);
        var parties = await db.Parties.Where(p => p.ChildId == child.Id).ToListAsync(cancellationToken);
        return ChildViews.For(child, parties, calendar);
    }
}
