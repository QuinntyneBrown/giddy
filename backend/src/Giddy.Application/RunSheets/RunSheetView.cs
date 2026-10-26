using Giddy.Application.Guests;

namespace Giddy.Application.RunSheets;

/// <summary>Everything the parent needs on the day, saved on their device for when there's no signal.</summary>
/// <param name="Date">yyyy-MM-dd.</param>
/// <param name="StartsAt">HH:mm.</param>
/// <param name="Coming">Children who said they're coming.</param>
/// <param name="Steps">Empty until Giddy drafts the run sheet.</param>
public sealed record RunSheetView(
    string Date,
    string StartsAt,
    string EndsAt,
    int Coming,
    IReadOnlyList<RunStepView> Steps,
    IReadOnlyList<QuickCall> Contacts,
    IReadOnlyList<AllergyEntry> Allergies);
