using MediatR;

namespace Giddy.Application.Guests.RecordEmailEvent;

/// <summary>A delivery event from the email provider; <paramref name="Reference"/> is the guest id the message was sent with.</summary>
public sealed record RecordEmailEventCommand(string Type, string? Reference) : IRequest;
