using MediatR;

namespace Giddy.Application.Places.CheckServiceArea;

public sealed record CheckServiceAreaQuery(string PostalCode) : IRequest<ServiceArea>;
