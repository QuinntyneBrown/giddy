using Giddy.Application.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.RunSheets;

public sealed class GetRunSheetHandler(IGiddyDbContext db, RunSheetReader reader) : IRequestHandler<GetRunSheetQuery, RunSheetView>
{
    public async Task<RunSheetView> Handle(GetRunSheetQuery request, CancellationToken cancellationToken) =>
        await reader.ViewAsync(await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken), cancellationToken);
}
