using Giddy.Domain.Home;

namespace Giddy.Application.Home;

public sealed record NudgeView(Guid PartyId, string PartyName, string Title, NudgeKind Kind, string Context, string ActionLabel);
