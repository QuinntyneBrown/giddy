using Giddy.Application.Common;
using Giddy.Application.Guests.SendReminders;
using Giddy.Application.Guests.ShareAllergyList;
using Giddy.Domain.Calendar;
using Giddy.Domain.Guests;
using Giddy.Domain.Parties;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Checklist.GiddyDoes;

/// <summary>Does the task the way the guest list would, then ticks it off.</summary>
public sealed class LetGiddyDoTaskHandler(IGiddyDbContext db, ISender sender, TorontoCalendar calendar)
    : IRequestHandler<LetGiddyDoTaskCommand, GiddyDidTask>
{
    public async Task<GiddyDidTask> Handle(LetGiddyDoTaskCommand request, CancellationToken cancellationToken)
    {
        var party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        var task = party.FindTask(request.TaskId) ?? throw new NotFoundException("Task not found.");
        if (task.Done || task.GiddyAction is null)
        {
            throw new ConflictException("Giddy can’t do this task for you.");
        }

        string message;
        switch (task.GiddyAction)
        {
            case GiddyActions.AllergyList:
                var shared = await sender.Send(new ShareAllergyListCommand(party.Id), cancellationToken);
                message = $"Allergy list sent to {shared.Venue}";
                break;
            case GiddyActions.RsvpReminder:
                var waiting = await db.Guests.Where(g => g.PartyId == party.Id && g.Rsvp == RsvpStatus.Waiting).Select(g => g.Id).ToListAsync(cancellationToken);
                if (waiting.Count == 0)
                {
                    throw new ConflictException("Everyone has replied, so there’s no one to remind.");
                }

                var sent = await sender.Send(new SendRemindersCommand(party.Id, waiting), cancellationToken);
                message = sent.Reminded.Count == 1 ? "Reminder sent to 1 family" : $"Reminders sent to {sent.Reminded.Count} families";
                break;
            default:
                throw new ConflictException("Giddy can’t do this task for you.");
        }

        party = await db.Parties.SingleAsync(p => p.Id == request.PartyId, cancellationToken);
        if (party.FindTask(request.TaskId) is { Done: false })
        {
            party.SetTaskDone(request.TaskId, true, calendar.Today);
            await db.SaveChangesAsync(cancellationToken);
        }

        return new GiddyDidTask(message);
    }
}
