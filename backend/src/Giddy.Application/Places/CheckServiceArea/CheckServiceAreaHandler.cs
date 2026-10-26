using Giddy.Domain.Places;
using MediatR;

namespace Giddy.Application.Places.CheckServiceArea;

public sealed class CheckServiceAreaHandler : IRequestHandler<CheckServiceAreaQuery, ServiceArea>
{
    public Task<ServiceArea> Handle(CheckServiceAreaQuery request, CancellationToken cancellationToken)
    {
        PostalCode.TryParse(request.PostalCode, out var postalCode);
        var region = GtaServiceArea.RegionOf(postalCode!);
        return Task.FromResult(new ServiceArea(postalCode!.Value, region is not null, region));
    }
}
