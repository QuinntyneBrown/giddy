using MediatR;

namespace Giddy.Application.Parties.CreateParty;

/// <param name="ChildId">One of the family's children; null for someone else.</param>
/// <param name="ChildName">Someone else's first name.</param>
/// <param name="TurningAge">Someone else's age on the day.</param>
/// <param name="Date">ISO calendar date, from tomorrow onwards.</param>
/// <param name="TimeOfDay">morning, afternoon or evening.</param>
/// <param name="TemplateId">A plan the parent saved from an earlier party, to start from.</param>
public sealed record CreatePartyCommand(
    Guid? ChildId,
    string? ChildName,
    int? TurningAge,
    string Date,
    int Guests,
    string TimeOfDay,
    decimal Budget,
    string PostalCode,
    Guid? TemplateId = null) : IRequest<PartySummary>;
