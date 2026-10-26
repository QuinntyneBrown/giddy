using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Guests.Import;

/// <summary>Reads a class list and says what importing it would do, without adding anyone.</summary>
public sealed record CheckImportCommand(Guid PartyId, ImportFile File) : IRequest<ImportPreview>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
