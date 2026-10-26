using Giddy.Application.Accounts;
using Giddy.Application.Common;
using Giddy.Domain.Families;
using Giddy.Domain.Notifications;
using Giddy.Domain.Parents;
using Giddy.Domain.Places;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Giddy.Application.Settings;

/// <summary>The signed-in parent's profile, email, quiet hours and channels.</summary>
public sealed class SettingsHandlers(IGiddyDbContext db, ICurrentParent current, AccountTokens tokens, IEmailSender email, IWebLinks links)
    : IRequestHandler<GetSettingsQuery, SettingsView>,
      IRequestHandler<UpdateProfileCommand, SettingsView>,
      IRequestHandler<RequestEmailChangeCommand>,
      IRequestHandler<SetQuietHoursCommand, SettingsView>,
      IRequestHandler<SetNotificationsCommand, SettingsView>
{
    public async Task<SettingsView> Handle(GetSettingsQuery request, CancellationToken cancellationToken) =>
        await ViewAsync(await ParentAsync(cancellationToken), cancellationToken);

    public async Task<SettingsView> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var parent = await ParentAsync(cancellationToken);
        parent.UpdateProfile(request.FirstName.Trim(), request.LastName?.Trim(), request.Mobile?.Trim());
        var family = await db.Families.SingleOrDefaultAsync(f => f.Id == parent.Id, cancellationToken);
        if (family is null)
        {
            family = new Family(parent.Id, string.Empty);
            db.Families.Add(family);
        }

        family.MoveTo(PostalCode.TryParse(request.PostalCode, out var code) ? code!.Value : string.Empty);
        await db.SaveChangesAsync(cancellationToken);
        return await ViewAsync(parent, cancellationToken);
    }

    /// <summary>The new address must be confirmed before it replaces the old one, which is told.</summary>
    public async Task Handle(RequestEmailChangeCommand request, CancellationToken cancellationToken)
    {
        var parent = await ParentAsync(cancellationToken);
        var address = EmailAddresses.Normalize(request.Email);
        if (await db.Parents.AnyAsync(p => p.Email == address && p.Id != parent.Id, cancellationToken))
        {
            throw new ConflictException("There’s already a Giddy account for that email");
        }

        parent.RequestEmailChange(address);
        var token = tokens.Issue(parent.Id, AccountTokenPurpose.ChangeEmail);
        await db.SaveChangesAsync(cancellationToken);
        await email.SendAsync(
            new EmailMessage(address, "Confirm your new email for Giddy", $"Hi {parent.Name},\n\nTap this link to use this address for Giddy:\n{links.To($"/verify-email?token={token}")}\n\nThe link works for 24 hours.", $"parent:{parent.Id}"),
            cancellationToken);
        await email.SendAsync(
            new EmailMessage(parent.Email, "Your Giddy email is changing", $"Hi {parent.Name},\n\nSomeone asked to change your Giddy email to {address}. It changes once the new address is confirmed. If this wasn’t you, choose a new password:\n{links.To("/forgot-password")}", $"parent:{parent.Id}"),
            cancellationToken);
    }

    public async Task<SettingsView> Handle(SetQuietHoursCommand request, CancellationToken cancellationToken)
    {
        var parent = await ParentAsync(cancellationToken);
        parent.SetQuietHours(request.On);
        await db.SaveChangesAsync(cancellationToken);
        return await ViewAsync(parent, cancellationToken);
    }

    public async Task<SettingsView> Handle(SetNotificationsCommand request, CancellationToken cancellationToken)
    {
        var parent = await ParentAsync(cancellationToken);
        Set(parent, NotificationCategory.Rsvps, request.Choices.Rsvps);
        Set(parent, NotificationCategory.Vendors, request.Choices.Vendors);
        Set(parent, NotificationCategory.Reminders, request.Choices.Reminders);
        Set(parent, NotificationCategory.Ideas, request.Choices.Ideas);
        await db.SaveChangesAsync(cancellationToken);
        return await ViewAsync(parent, cancellationToken);
    }

    private static void Set(Parent parent, NotificationCategory category, Channels channels) =>
        parent.SetChannels(category, channels.Email, channels.Text, channels.Push);

    private Task<Parent> ParentAsync(CancellationToken cancellationToken) =>
        db.Parents.SingleAsync(p => p.Id == current.Id, cancellationToken);

    private async Task<SettingsView> ViewAsync(Parent parent, CancellationToken cancellationToken)
    {
        var postalCode = await db.Families.Where(f => f.Id == parent.Id).Select(f => f.PostalCode).SingleOrDefaultAsync(cancellationToken);
        Channels For(NotificationCategory category)
        {
            var c = parent.Channels(category);
            return new Channels(c.Email, c.Text, c.Push);
        }

        return new SettingsView(
            parent.Name,
            parent.LastName,
            parent.Email,
            parent.PendingEmail,
            parent.Mobile,
            string.IsNullOrEmpty(postalCode) ? null : postalCode,
            parent.QuietHours,
            new NotificationChoices(For(NotificationCategory.Rsvps), For(NotificationCategory.Vendors), For(NotificationCategory.Reminders), For(NotificationCategory.Ideas)));
    }
}
