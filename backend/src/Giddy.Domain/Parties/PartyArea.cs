namespace Giddy.Domain.Parties;

/// <summary>The party's neighbourhood, the point distances are measured from, and how far to look.</summary>
public sealed record PartyArea(string Name, double Latitude, double Longitude, int SearchRadiusKm);
