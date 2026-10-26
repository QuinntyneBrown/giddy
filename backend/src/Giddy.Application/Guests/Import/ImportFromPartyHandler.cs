using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Guests.Import;

public sealed class ImportFromPartyHandler(IGiddyDbContext db, ICurrentParent parent, GuestImporter importer) : IRequestHandler<ImportFromPartyCommand, ImportReport>
{
    public async Task<ImportReport> Handle(ImportFromPartyCommand request, CancellationToken cancellationToken)
    {
        if (request.SourcePartyId == request.PartyId
            || !await db.Parties.AnyAsync(p => p.Id == request.SourcePartyId && p.Members.Any(m => m.ParentId == parent.Id), cancellationToken))
        {
            throw new NotFoundException("Party not found.");
        }

        var guests = await db.Guests.Where(g => g.PartyId == request.SourcePartyId).OrderBy(g => g.ChildName).ToListAsync(cancellationToken);
        var rows = guests.Select((g, i) => new ImportRow(i + 1, g.ChildName, g.ParentName, g.Email, g.Mobile)).ToList();
        return await importer.ImportAsync(request.PartyId, rows, cancellationToken);
    }
}
