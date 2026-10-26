using FluentValidation;
using Giddy.Application.Agent;
using Giddy.Application.Agent.Tools;
using Giddy.Application.Common;
using Giddy.Application.Conversations;
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
        services.AddScoped<ConversationAccess>();
        services.AddScoped<ConversationViewBuilder>();
        services.AddScoped<CatalogueSearch>();
        services.AddScoped<ProposalValidator>();
        services.AddScoped<TurnLogger>();
        services.AddScoped<AgentLoop>();
        services.AddScoped<Venues.VenueOrigins>();
        services.AddScoped<Venues.Search.VenueCandidates>();
        services.AddScoped<Bookings.BookingCompletion>();
        services.AddScoped<Invitations.InvitationReader>();
        services.AddScoped<Invitations.InvitationDelivery>();
        services.AddScoped<Rsvps.RsvpLinks>();
        services.AddSingleton<TurnCancellations>();
        services.AddScoped<IAgentTool, ListThemesTool>();
        services.AddScoped<IAgentTool, SearchVenuesTool>();
        services.AddScoped<IAgentTool, FindEntertainersTool>();
        services.AddScoped<IAgentTool, FindCakesTool>();
        services.AddScoped<IAgentTool, FindFoodTool>();
        services.AddScoped<IAgentTool, FindLootBagsTool>();
        services.AddScoped<IAgentTool, RememberTool>();
        services.AddScoped<IAgentTool, SuggestRepliesTool>();
        services.AddScoped<IAgentTool, ProposePlanTool>();
        return services;
    }
}
