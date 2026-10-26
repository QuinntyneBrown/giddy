using Giddy.Application.Common;
using Giddy.Domain;
using Giddy.Domain.Calendar;
using Giddy.Domain.Parties;
using Giddy.Domain.Places;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime.Text;

namespace Giddy.Application.Parties.CreateParty;

/// <summary>Creates a party with the signed-in parent as its owner.</summary>
public sealed class CreatePartyHandler(IGiddyDbContext db, ICurrentParent parent, TorontoCalendar calendar, PartySummaryMapper mapper)
    : IRequestHandler<CreatePartyCommand, PartySummary>
{
    public async Task<PartySummary> Handle(CreatePartyCommand request, CancellationToken cancellationToken)
    {
        var date = LocalDatePattern.Iso.Parse(request.Date).Value;
        var (childName, age) = (request.ChildName?.Trim() ?? string.Empty, request.TurningAge ?? 0);
        if (request.ChildId is { } childId)
        {
            var family = await db.Families.SingleAsync(f => f.Id == parent.Id, cancellationToken);
            var child = family.Children.Single(c => c.Id == childId);
            (childName, age) = (child.FirstName, child.TurningAge(calendar.Today));
        }

        var slot = Enum.Parse<TimeSlot>(request.TimeOfDay, ignoreCase: true);
        var (start, end) = TimeSlots.Hours(slot);
        PostalCode.TryParse(request.PostalCode, out var postalCode);
        var party = Party.Plan(Guid.NewGuid(), $"{childName}’s {Ordinal.Of(age)} birthday", date, start, end, parent.Id);
        party.Describe(childName, age, GtaAreas.Resolve(postalCode!), request.Guests, request.Budget, request.ChildId);
        db.Parties.Add(party);
        await db.SaveChangesAsync(cancellationToken);
        return mapper.Map(party, parent.Id);
    }
}
