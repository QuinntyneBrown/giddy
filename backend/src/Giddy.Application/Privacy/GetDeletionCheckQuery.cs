using MediatR;

namespace Giddy.Application.Privacy;

public sealed record GetDeletionCheckQuery : IRequest<DeletionCheck>;
