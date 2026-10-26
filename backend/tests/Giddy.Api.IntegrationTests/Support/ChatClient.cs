using System.Net.Http.Json;
using System.Text.Json;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>Talks to the conversation endpoints the way the web app does.</summary>
public sealed class ChatClient(HttpClient http)
{
    public HttpClient Http => http;

    public async Task<JsonElement> CurrentAsync() =>
        await http.GetFromJsonAsync<JsonElement>("/api/conversations/current");

    public async Task<(Guid ConversationId, Guid TurnId)> SendAsync(string text)
    {
        var conversation = await CurrentAsync();
        var conversationId = conversation.GetProperty("id").GetGuid();
        var response = await http.PostAsJsonAsync($"/api/conversations/{conversationId}/messages", new { text });
        response.EnsureSuccessStatusCode();
        var accepted = await response.Content.ReadFromJsonAsync<JsonElement>();
        return (conversationId, accepted.GetProperty("turnId").GetGuid());
    }

    /// <summary>Polls the turn until it stops running, then returns its status and events.</summary>
    public async Task<JsonElement> WaitForTurnAsync(Guid conversationId, Guid turnId, TimeSpan? timeout = null)
    {
        var deadline = DateTime.UtcNow + (timeout ?? TimeSpan.FromSeconds(10));
        while (true)
        {
            var turn = await http.GetFromJsonAsync<JsonElement>($"/api/conversations/{conversationId}/turns/{turnId}?after=0");
            if (turn.GetProperty("status").GetString() != "running" || DateTime.UtcNow > deadline)
            {
                return turn;
            }

            await Task.Delay(50);
        }
    }

    public async Task<JsonElement> LastGiddyMessageAsync()
    {
        var conversation = await CurrentAsync();
        return conversation.GetProperty("messages").EnumerateArray().Last(m => m.GetProperty("author").GetString() == "giddy");
    }
}
