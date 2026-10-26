using MediatR;

namespace Giddy.Application.Privacy;

public sealed record GetExportQuery(Guid ExportId) : IRequest<string>;
