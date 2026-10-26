using System.Text.Json.Serialization;
using Giddy.Api.Authentication;
using Giddy.Api.Endpoints;
using Giddy.Api.Errors;
using Giddy.Api.Logging;
using Giddy.Api.Security;
using Giddy.Infrastructure;
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddPlanningAgent(builder.Configuration);
builder.Services.AddGiddyAuthentication();
builder.Services.AddGiddyAntiforgery();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GiddyExceptionHandler>();
builder.Services.AddGiddyRateLimits();
builder.Services.AddDataProtection();
builder.Services.AddSingleton<Giddy.Application.Common.ISecretProtector, DataProtectionSecretProtector>();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase)));

var app = builder.Build();

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.UseMiddleware<AntiforgeryValidationMiddleware>();

app.MapGet("/health", () => Results.Ok(new { status = "ok" })).AllowAnonymous();
app.MapSessionEndpoints();
app.MapPartyEndpoints();
app.MapServiceAreaEndpoints();
app.MapConversationEndpoints();
app.MapMemoryEndpoints();
app.MapHomeEndpoints();
app.MapVenueEndpoints();
app.MapBookingEndpoints();
app.MapGuestEndpoints();
app.MapInvitationEndpoints();
app.MapRsvpEndpoints();
app.MapLiveUpdateEndpoints();
app.MapEmailEventEndpoints();
app.MapImportEndpoints();
app.MapVendorEndpoints();
app.MapThemeEndpoints();
app.MapBudgetEndpoints();
app.MapChecklistEndpoints();
app.MapRunSheetEndpoints();

app.Run();

public partial class Program;
