using MediatR;

namespace Giddy.Application.Parties.GetMyParties;

public sealed record GetMyPartiesQuery : IRequest<IReadOnlyList<PartySummary>>;
