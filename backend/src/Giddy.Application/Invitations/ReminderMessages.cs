using System.Globalization;
using Giddy.Application.Common;
using Giddy.Domain.Invitations;

namespace Giddy.Application.Invitations;

/// <summary>A friendly nudge to families who haven't replied yet.</summary>
public static class ReminderMessages
{
    public static EmailMessage Email(string to, Invitation invitation, InvitationDetails details, string link, string? reference = null) => new(
        to,
        $"Reminder: please reply for {details.ChildName}’s party",
        $"""
        {details.HostName} would love to know if you can come to {details.ChildName}’s party.

        Please reply by {RsvpBy(invitation)}: {link}
        """,
        reference);

    public static TextMessage Text(string to, Invitation invitation, InvitationDetails details, string link) => new(
        to,
        $"Reminder from {details.HostName}: please reply for {details.ChildName}’s party by {RsvpBy(invitation)}: {link}");

    private static string RsvpBy(Invitation invitation) => invitation.RsvpBy.ToString("ddd d MMM", CultureInfo.InvariantCulture);
}
