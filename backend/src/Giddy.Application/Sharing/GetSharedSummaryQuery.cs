using MediatR;

namespace Giddy.Application.Sharing;

public sealed record GetSharedSummaryQuery(string Token) : IRequest<SharedSummary>;
