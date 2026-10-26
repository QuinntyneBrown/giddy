using MediatR;

namespace Giddy.Application.Rsvps.GetRsvp;

public sealed record GetRsvpQuery(string Token) : IRequest<RsvpView>;
