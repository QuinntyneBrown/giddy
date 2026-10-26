using Giddy.Application.Common;
using Giddy.Domain.Parents;

namespace Giddy.Application.Accounts;

/// <summary>The account emails: confirm, reset and new sign-in.</summary>
public sealed class AccountEmails(IEmailSender email, IWebLinks links)
{
    public Task ConfirmAsync(Parent parent, string token, CancellationToken cancellationToken) =>
        email.SendAsync(
            new EmailMessage(
                parent.Email,
                "Confirm your email for Giddy",
                $"Hi {parent.Name},\n\nTap this link to confirm it’s you, then we’ll set up your family:\n{links.To($"/verify-email?token={token}")}\n\nThe link works for 24 hours.",
                $"parent:{parent.Id}"),
            cancellationToken);

    public async Task ResetAsync(Parent parent, string token, CancellationToken cancellationToken)
    {
        try
        {
            await email.SendAsync(
                new EmailMessage(
                    parent.Email,
                    "Reset your Giddy password",
                    $"Hi {parent.Name},\n\nChoose a new password here:\n{links.To($"/reset-password?token={token}")}\n\nThe link works for 30 minutes and only once. If you didn’t ask for it, you can ignore this email.",
                    $"parent:{parent.Id}"),
                cancellationToken);
        }
        catch (Exception exception) when (exception is not OperationCanceledException)
        {
            throw new EmailNotSentException("We couldn’t send the email just now", exception);
        }
    }

    public Task NewDeviceAsync(Parent parent, string device, string location, CancellationToken cancellationToken) =>
        email.SendAsync(
            new EmailMessage(
                parent.Email,
                "New sign-in to Giddy",
                $"Hi {parent.Name},\n\nYour Giddy account was just signed in to from {device} near {location}.\n\nIf this was you, there’s nothing to do. If it wasn’t, secure your account by choosing a new password:\n{links.To("/forgot-password")}",
                $"parent:{parent.Id}"),
            cancellationToken);
}
