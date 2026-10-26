using System.Globalization;
using Giddy.Application.Common;
using Giddy.Domain.Invitations;
using NodaTime;
using NodaTime.Text;

namespace Giddy.Application.Invitations;

/// <summary>The invitation as an email and as a text.</summary>
public static class InvitationMessages
{
    public static EmailMessage Email(string to, Invitation invitation, InvitationDetails details, string link, string? reference = null) => new(
        to,
        $"You’re invited: {invitation.Headline}",
        $"""
        {invitation.Headline}
        {When(details)}{(details.Place is null ? string.Empty : $" · {details.Place}")}

        {invitation.Message}

        Please reply by {Day(invitation.RsvpBy)}: {link}

        Sent by {details.HostName} with Giddy.
        """,
        reference);

    public static TextMessage Text(string to, Invitation invitation, InvitationDetails details, string link) => new(
        to,
        $"{details.HostName} invited you to {details.ChildName}’s party, {When(details)}. Reply by {Day(invitation.RsvpBy)}: {link}");

    private static string When(InvitationDetails details)
    {
        var date = LocalDatePattern.Iso.Parse(details.Date).Value;
        return $"{Day(date)}, {details.StartsAt}–{details.EndsAt}";
    }

    private static string Day(LocalDate date) => date.ToString("ddd d MMM", CultureInfo.InvariantCulture);
}
