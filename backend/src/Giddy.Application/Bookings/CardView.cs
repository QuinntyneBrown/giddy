namespace Giddy.Application.Bookings;

/// <summary>Only what the provider lets Giddy keep: the brand and the last four digits.</summary>
public sealed record CardView(string Brand, string Last4);
