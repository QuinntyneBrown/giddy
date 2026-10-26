using MediatR;

namespace Giddy.Application.Home;

/// <summary>Giddy's nudges, loaded separately so a failure stays in the nudges card.</summary>
public sealed record GetNudgesQuery : IRequest<IReadOnlyList<NudgeView>>;
