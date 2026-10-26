using MediatR;

namespace Giddy.Application.Guests.Import;

public sealed class CheckImportHandler(GuestImporter importer) : IRequestHandler<CheckImportCommand, ImportPreview>
{
    public async Task<ImportPreview> Handle(CheckImportCommand request, CancellationToken cancellationToken) =>
        await importer.PreviewAsync(request.PartyId, request.File.FileName, await importer.ReadAsync(request.File, cancellationToken), cancellationToken);
}
