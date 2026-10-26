using FluentValidation;
using Giddy.Application.Common;
using Giddy.Application.Parties;
using Giddy.Domain.Calendar;
using Microsoft.Extensions.DependencyInjection;

namespace Giddy.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(config =>
        {
            config.RegisterServicesFromAssemblyContaining<PartySummary>();
            // Authorise first, so a parent who cannot know a party exists never learns it from validation errors.
            config.AddOpenBehavior(typeof(PartyAuthorizationBehavior<,>));
            config.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });
        services.AddValidatorsFromAssemblyContaining<PartySummary>(includeInternalTypes: true);
        services.AddScoped<PartySummaryMapper>();
        services.AddScoped<TorontoCalendar>();
        return services;
    }
}
