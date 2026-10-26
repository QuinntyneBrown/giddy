using MediatR;

namespace Giddy.Application.Accounts.Reset;

/// <summary>Whose reset link this is, before they choose a new password.</summary>
public sealed record CheckResetLinkQuery(string Token) : IRequest<ResetLink>;
