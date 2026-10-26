namespace Giddy.Application.Settings;

/// <summary>The channels for each kind of message.</summary>
public sealed record NotificationChoices(Channels Rsvps, Channels Vendors, Channels Reminders, Channels Ideas);
