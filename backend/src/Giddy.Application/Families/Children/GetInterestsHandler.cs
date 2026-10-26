using Giddy.Domain.Families;
using MediatR;

namespace Giddy.Application.Families.Children;

public sealed class GetInterestsHandler : IRequestHandler<GetInterestsQuery, IReadOnlyList<Interest>>
{
    public Task<IReadOnlyList<Interest>> Handle(GetInterestsQuery request, CancellationToken cancellationToken) =>
        Task.FromResult(Interests.All);
}
