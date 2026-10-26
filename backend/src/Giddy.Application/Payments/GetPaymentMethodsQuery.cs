using MediatR;

namespace Giddy.Application.Payments;

/// <summary>The signed-in parent's saved cards.</summary>
public sealed record GetPaymentMethodsQuery : IRequest<IReadOnlyList<SavedCardView>>;
