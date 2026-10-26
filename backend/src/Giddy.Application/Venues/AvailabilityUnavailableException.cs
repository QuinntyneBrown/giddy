namespace Giddy.Application.Venues;

/// <summary>Venue partners did not answer in time, so free slots are unknown.</summary>
public sealed class AvailabilityUnavailableException(string message) : Exception(message);
