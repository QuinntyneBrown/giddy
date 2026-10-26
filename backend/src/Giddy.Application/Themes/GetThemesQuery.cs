using MediatR;

namespace Giddy.Application.Themes;

/// <param name="ForChild">Only themes suiting the party child's age; on by default when there is a child.</param>
/// <param name="AgeBand">For example "3-5", "6-8" or "9-12".</param>
public sealed record GetThemesQuery(Guid? PartyId, bool? ForChild, string? AgeBand, bool Outdoor, bool BudgetFriendly) : IRequest<ThemeList>;
