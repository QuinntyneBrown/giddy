using Giddy.Application.Guests.Import;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class ImportEndpoints
{
    public static IEndpointRouteBuilder MapImportEndpoints(this IEndpointRouteBuilder app)
    {
        var imports = app.MapGroup("/api/parties/{partyId:guid}/imports");

        // Uploads carry the X-XSRF-TOKEN header, which AntiforgeryValidationMiddleware checks.
        imports.MapPost("/check", async (Guid partyId, IFormFile file, ISender sender, CancellationToken cancel) =>
            await sender.Send(new CheckImportCommand(partyId, await ReadAsync(file, cancel)), cancel)).DisableAntiforgery();

        imports.MapPost("/", async (Guid partyId, IFormFile file, ISender sender, CancellationToken cancel) =>
            await sender.Send(new ImportGuestsCommand(partyId, await ReadAsync(file, cancel)), cancel)).DisableAntiforgery();

        imports.MapGet("/sources", (Guid partyId, ISender sender, CancellationToken cancel) =>
            sender.Send(new GetImportSourcesQuery(partyId), cancel));

        imports.MapPost("/from-party", (Guid partyId, ImportFromPartyRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(new ImportFromPartyCommand(partyId, request.SourcePartyId), cancel));

        return app;
    }

    /// <summary>Holds the upload in memory, unless it is already over the limit.</summary>
    private static async Task<ImportFile> ReadAsync(IFormFile file, CancellationToken cancel)
    {
        if (file.Length > GuestImporter.MaximumFileBytes)
        {
            return new ImportFile(file.FileName, file.Length, []);
        }

        using var buffer = new MemoryStream();
        await file.OpenReadStream().CopyToAsync(buffer, cancel);
        return new ImportFile(file.FileName, file.Length, buffer.ToArray());
    }
}
