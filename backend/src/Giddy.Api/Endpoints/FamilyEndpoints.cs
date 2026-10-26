using Giddy.Application.Families.Children;
using MediatR;

namespace Giddy.Api.Endpoints;

public static class FamilyEndpoints
{
    public static IEndpointRouteBuilder MapFamilyEndpoints(this IEndpointRouteBuilder app)
    {
        var family = app.MapGroup("/api/family");

        family.MapGet("/interests", (ISender sender, CancellationToken cancel) => sender.Send(new GetInterestsQuery(), cancel));

        family.MapPost("/children", async (ChildRequest request, ISender sender, CancellationToken cancel) =>
        {
            var child = await sender.Send(Save(null, request), cancel);
            return Results.Created($"/api/family/children/{child.Id}", child);
        });

        family.MapPut("/children/{childId:guid}", (Guid childId, ChildRequest request, ISender sender, CancellationToken cancel) =>
            sender.Send(Save(childId, request), cancel));

        family.MapDelete("/children/{childId:guid}", async (Guid childId, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new RemoveChildCommand(childId), cancel);
            return Results.NoContent();
        });

        return app;
    }

    private static SaveChildCommand Save(Guid? childId, ChildRequest request) =>
        new(childId, request.FirstName ?? string.Empty, request.Birthday ?? string.Empty, request.Interests ?? [], request.Allergies);
}
