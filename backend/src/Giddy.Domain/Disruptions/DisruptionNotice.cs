using Giddy.Domain.Catalogue;
using NodaTime;

namespace Giddy.Domain.Disruptions;

/// <summary>A transit or city notice for an area and dates, for example a TTC weekend closure.</summary>
public sealed class DisruptionNotice
{
    private DisruptionNotice()
    {
        Title = string.Empty;
        Detail = string.Empty;
    }

    public DisruptionNotice(Guid id, string title, string detail, double latitude, double longitude, double radiusKm, LocalDate from, LocalDate to)
    {
        Id = id;
        Title = title;
        Detail = detail;
        Latitude = latitude;
        Longitude = longitude;
        RadiusKm = radiusKm;
        From = from;
        To = to;
    }

    public Guid Id { get; private set; }

    public string Title { get; private set; }

    public string Detail { get; private set; }

    public double Latitude { get; private set; }

    public double Longitude { get; private set; }

    public double RadiusKm { get; private set; }

    public LocalDate From { get; private set; }

    public LocalDate To { get; private set; }

    public bool Affects(double latitude, double longitude, LocalDate date) =>
        date >= From && date <= To && Distance.Kilometres(Latitude, Longitude, latitude, longitude) <= RadiusKm;
}
