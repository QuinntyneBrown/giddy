using MediatR;

namespace Giddy.Application.Live;

/// <summary>Updates on the parent's parties after a cursor; without one, just the current cursor.</summary>
public sealed record GetLiveUpdatesQuery(long? After) : IRequest<LiveUpdates>;
