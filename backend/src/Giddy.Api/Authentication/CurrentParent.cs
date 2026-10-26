using System.Security.Claims;
using Giddy.Application.Common;

namespace Giddy.Api.Authentication;

/// <summary>Reads the signed-in parent from the authenticated request.</summary>
public sealed class CurrentParent(IHttpContextAccessor accessor) : ICurrentParent
{
    private ClaimsPrincipal User => accessor.HttpContext?.User
        ?? throw new InvalidOperationException("There is no current request.");

    public Guid Id => Guid.Parse(Claim(ClaimTypes.NameIdentifier));

    public string Name => Claim(ClaimTypes.Name);

    public string Email => Claim(ClaimTypes.Email);

    private string Claim(string type) => User.FindFirstValue(type)
        ?? throw new InvalidOperationException($"The signed-in parent has no {type} claim.");
}
