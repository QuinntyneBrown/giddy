using MediatR;

namespace Giddy.Application.Home;

public sealed record GetHomeQuery : IRequest<HomeView>;
