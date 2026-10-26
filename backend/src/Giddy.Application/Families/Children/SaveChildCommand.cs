using MediatR;

namespace Giddy.Application.Families.Children;

/// <param name="ChildId">Null to add a child; the child's id to change them.</param>
/// <param name="Birthday">yyyy-MM-dd.</param>
public sealed record SaveChildCommand(Guid? ChildId, string FirstName, string Birthday, IReadOnlyList<string> Interests, string? Allergies)
    : IRequest<ChildView>;
