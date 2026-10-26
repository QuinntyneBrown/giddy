using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Themes;

/// <param name="ThemeId">The theme to use, or null for none.</param>
public sealed record SetPartyThemeCommand(Guid PartyId, Guid? ThemeId) : IRequest<ThemeChange>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
