using System.Globalization;
using System.Text;
using Giddy.Domain.Conversations;
using Giddy.Domain.Memories;
using Giddy.Domain.Parties;
using NodaTime;

namespace Giddy.Application.Agent;

/// <summary>
/// The single user message for a turn: what Giddy knows about the party and family, the
/// conversation so far, and the new message. Each turn starts fresh, so history is never edited.
/// </summary>
public static class TurnTranscript
{
    public static string Build(Conversation conversation, Party? party, IReadOnlyList<Memory> memories, LocalDate today, string parentName)
    {
        var text = new StringBuilder();
        text.AppendLine($"Today in Toronto is {today.ToString("dddd d MMMM yyyy", CultureInfo.InvariantCulture)}. The parent is {parentName}.");
        if (party is not null)
        {
            text.AppendLine("<party>");
            text.AppendLine($"Name: {party.Name}");
            if (party.ChildName is not null) text.AppendLine($"Child: {party.ChildName}, turning {party.TurningAge}");
            text.AppendLine($"Date: {party.Date.ToString("dddd d MMMM yyyy", CultureInfo.InvariantCulture)}, {TimeOfDay.Of(party.StartsAt)} ({party.StartsAt:HH:mm}–{party.EndsAt:HH:mm})");
            if (party.Area is { } area) text.AppendLine($"Area: {area.Name}, within {area.SearchRadiusKm} km");
            if (party.GuestCount is { } guests) text.AppendLine($"Guests: about {guests} kids");
            if (party.Budget is { } budget) text.AppendLine($"Budget: ${budget} including HST");
            if (party.Allergies.Length > 0) text.AppendLine($"Allergies: {string.Join(", ", party.Allergies)}");
            text.AppendLine("</party>");
        }

        if (memories.Count > 0)
        {
            text.AppendLine("<family_memories>");
            foreach (var memory in memories) text.AppendLine($"- {memory.Text}");
            text.AppendLine("</family_memories>");
        }

        var earlier = conversation.Messages.Take(conversation.Messages.Count - 1).ToList();
        if (earlier.Count > 0)
        {
            text.AppendLine("<conversation_so_far>");
            foreach (var message in earlier)
            {
                text.AppendLine($"{(message.Author == MessageAuthor.Parent ? "Parent" : "Giddy")}: {message.Text}");
            }

            text.AppendLine("</conversation_so_far>");
        }

        text.AppendLine("<new_message>");
        text.AppendLine(conversation.Messages[^1].Text);
        text.AppendLine("</new_message>");
        return text.ToString();
    }
}
