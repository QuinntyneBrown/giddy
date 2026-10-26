using Giddy.Application.Common;
using Giddy.Domain.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Giddy.Application.Notifications.Sms;

/// <summary>STOP (and the other standard opt-out words) turns texts off for that number straight away.</summary>
public sealed class RecordSmsReplyHandler(IGiddyDbContext db, IClock clock) : IRequestHandler<RecordSmsReplyCommand>
{
    private static readonly HashSet<string> StopWords = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT", "ARRET"];

    public async Task Handle(RecordSmsReplyCommand request, CancellationToken cancellationToken)
    {
        var number = SmsOptOut.Normalize(request.From);
        if (!StopWords.Contains(request.Text.Trim().ToUpperInvariant()) || number.Length != 10
            || await db.SmsOptOuts.AnyAsync(o => o.Number == number, cancellationToken))
        {
            return;
        }

        db.SmsOptOuts.Add(new SmsOptOut(number, clock.GetCurrentInstant()));
        await db.SaveChangesAsync(cancellationToken);
    }
}
