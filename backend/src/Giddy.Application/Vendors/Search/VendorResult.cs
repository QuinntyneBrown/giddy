namespace Giddy.Application.Vendors.Search;

/// <param name="PlanStatus">inYourPlan, quoteRequested, quoteReceived or booked, when the vendor is in the plan.</param>
public sealed record VendorResult(
    Guid Id,
    string Name,
    string Emoji,
    string Description,
    string Category,
    string Neighbourhood,
    decimal Price,
    string PriceBasis,
    decimal Rating,
    int ReviewCount,
    int? DurationMinutes,
    int? MinAge,
    int? MaxAge,
    int? NoticeDays,
    IReadOnlyList<string> Dietary,
    IReadOnlyList<AllergyFit> AllergyFit,
    string? PlanStatus);
