using MediatR;

namespace Giddy.Application.Wrapping;

public sealed record GetTemplateQuery(Guid TemplateId) : IRequest<TemplateSummary>;
