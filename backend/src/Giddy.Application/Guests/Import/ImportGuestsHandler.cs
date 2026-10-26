using MediatR;

namespace Giddy.Application.Guests.Import;

public sealed class ImportGuestsHandler(GuestImporter importer) : IRequestHandler<ImportGuestsCommand, ImportReport>
{
    public async Task<ImportReport> Handle(ImportGuestsCommand request, CancellationToken cancellationToken) =>
        await importer.ImportAsync(request.PartyId, await importer.ReadAsync(request.File, cancellationToken), cancellationToken);
}
