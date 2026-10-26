using Giddy.Domain.Families;
using MediatR;

namespace Giddy.Application.Families.Children;

public sealed record GetInterestsQuery : IRequest<IReadOnlyList<Interest>>;
