using Giddy.Application.Common;
using Microsoft.Extensions.Logging;

namespace Giddy.Infrastructure.Bookings;

/// <summary>Records outgoing email until an email provider is connected. Addresses and bodies are not logged.</summary>
public sealed class LoggingEmailSender(ILogger<LoggingEmailSender> logger) : IEmailSender
{
    public Task SendAsync(EmailMessage message, CancellationToken cancellationToken)
    {
        logger.LogInformation("Email queued: {Subject}", message.Subject);
        return Task.CompletedTask;
    }
}
