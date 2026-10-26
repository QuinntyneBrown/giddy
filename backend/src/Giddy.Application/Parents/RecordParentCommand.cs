using MediatR;

namespace Giddy.Application.Parents;

/// <summary>Keeps the signed-in parent's name and email current so co-planners see them.</summary>
public sealed record RecordParentCommand : IRequest;
