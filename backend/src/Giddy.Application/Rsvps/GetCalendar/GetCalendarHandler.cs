using System.Globalization;
using Giddy.Application.Invitations;
using MediatR;
using NodaTime;

namespace Giddy.Application.Rsvps.GetCalendar;

public sealed class GetCalendarHandler(RsvpLinks links, InvitationReader reader, IClock clock) : IRequestHandler<GetCalendarQuery, string>
{
    public async Task<string> Handle(GetCalendarQuery request, CancellationToken cancellationToken)
    {
        var (guest, party, invitation) = await links.ResolveAsync(request.Token, cancellationToken);
        var details = await reader.DetailsAsync(party, cancellationToken);
        string Local(LocalTime time) => party.Date.At(time).ToString("yyyyMMdd'T'HHmmss", CultureInfo.InvariantCulture);
        static string Escape(string text) => text.Replace("\\", "\\\\").Replace(";", "\\;").Replace(",", "\\,").Replace("\n", "\\n");
        var lines = new List<string>
        {
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Giddy//Invitations//EN",
            "BEGIN:VEVENT",
            $"UID:{guest.Id}@giddy",
            $"DTSTAMP:{clock.GetCurrentInstant().ToDateTimeUtc():yyyyMMdd'T'HHmmss'Z'}",
            $"DTSTART;TZID=America/Toronto:{Local(party.StartsAt)}",
            $"DTEND;TZID=America/Toronto:{Local(party.EndsAt)}",
            $"SUMMARY:{Escape($"{details.ChildName}’s birthday party")}",
            $"DESCRIPTION:{Escape(invitation.Message)}",
        };
        if (details.Place is { } place)
        {
            lines.Add($"LOCATION:{Escape(place)}");
        }

        lines.AddRange(["END:VEVENT", "END:VCALENDAR"]);
        return string.Join("\r\n", lines) + "\r\n";
    }
}
