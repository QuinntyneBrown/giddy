using Giddy.Application.Parties;
using MediatR;

namespace Giddy.Application.Guests.SendReminders;

public sealed record SendRemindersCommand(Guid PartyId, IReadOnlyList<Guid> GuestIds) : IRequest<RemindersSent>, IPartyRequest
{
    public PartyAccess RequiredAccess => PartyAccess.Plan;
}
