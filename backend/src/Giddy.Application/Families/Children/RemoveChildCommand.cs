using MediatR;

namespace Giddy.Application.Families.Children;

public sealed record RemoveChildCommand(Guid ChildId) : IRequest;
