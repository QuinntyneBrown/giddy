using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Wrapping;

/// <param name="Message">The parent's own wording; null keeps Giddy's draft.</param>
public sealed record SaveThankYouCommand(Guid PartyId, Guid GuestId, string? Gift, string? Message) : IRequest, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.WrapUp;
}
