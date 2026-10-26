namespace Giddy.Domain.Notifications;

/// <summary>How a parent wants to hear about one category of messages.</summary>
public sealed record ChannelSetting(NotificationCategory Category, bool Email, bool Text, bool Push);
