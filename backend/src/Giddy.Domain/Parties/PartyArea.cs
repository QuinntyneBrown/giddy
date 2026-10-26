namespace Giddy.Domain.Parties;

/// <summary>
/// The party's neighbourhood, the point distances are measured from, how far to look, and whether
/// it is inside the GTA, which is all Giddy covers for now.
/// </summary>
public sealed record PartyArea(string Name, double Latitude, double Longitude, int SearchRadiusKm, bool InServiceArea = true);
