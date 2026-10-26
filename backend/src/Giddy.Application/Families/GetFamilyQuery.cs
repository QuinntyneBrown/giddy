using MediatR;

namespace Giddy.Application.Families;

public sealed record GetFamilyQuery : IRequest<FamilyView>;
