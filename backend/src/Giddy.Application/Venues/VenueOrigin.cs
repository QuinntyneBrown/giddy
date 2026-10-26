using Giddy.Domain.Parties;

namespace Giddy.Application.Venues;

/// <summary>Where distances are measured from, and whether it is inside the GTA.</summary>
public sealed record VenueOrigin(PartyArea Area, bool InServiceArea, Party? Party);
