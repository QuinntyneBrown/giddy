using MediatR;

namespace Giddy.Application.Rsvps.GetCalendar;

/// <summary>The party as an iCalendar event, for "Add to my calendar".</summary>
public sealed record GetCalendarQuery(string Token) : IRequest<string>;
