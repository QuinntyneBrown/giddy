using System.Text.Json;

namespace Giddy.Application.Agent;

public static class ToolSchema
{
    public static JsonElement Parse(string json) => JsonDocument.Parse(json).RootElement.Clone();

    public static readonly JsonElement Empty = Parse("""{"type":"object","properties":{},"additionalProperties":false}""");

    public static string? OptionalString(JsonElement input, string name) =>
        input.ValueKind == JsonValueKind.Object && input.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String
            ? value.GetString()
            : null;
}
