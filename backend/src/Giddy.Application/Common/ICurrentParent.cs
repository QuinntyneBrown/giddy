namespace Giddy.Application.Common;

/// <summary>The signed-in parent making the current request.</summary>
public interface ICurrentParent
{
    Guid Id { get; }

    string Name { get; }

    string Email { get; }

    bool EmailVerified { get; }
}
