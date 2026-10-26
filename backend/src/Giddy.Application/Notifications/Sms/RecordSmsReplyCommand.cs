using MediatR;

namespace Giddy.Application.Notifications.Sms;

/// <summary>A reply to one of Giddy's texts, from the SMS provider.</summary>
public sealed record RecordSmsReplyCommand(string From, string Text) : IRequest;
