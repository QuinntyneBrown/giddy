namespace Giddy.Application.Conversations.Views;

/// <summary>Who, when, where, guests and budget, shown beside the chat from 1024px.</summary>
public sealed record PartyAtAGlance(
    Guid PartyId,
    string Name,
    string? ChildName,
    int? TurningAge,
    string? Who,
    string Date,
    string TimeOfDay,
    string? Area,
    int? RadiusKm,
    int? Guests,
    decimal? Budget);
