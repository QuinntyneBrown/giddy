namespace Giddy.Application.Settings;

/// <param name="PendingEmail">A new address waiting for confirmation; null when none.</param>
public sealed record SettingsView(
    string FirstName,
    string? LastName,
    string Email,
    string? PendingEmail,
    string? Mobile,
    string? PostalCode,
    bool QuietHours,
    NotificationChoices Notifications);
