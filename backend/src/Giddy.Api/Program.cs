using Giddy.Api.Authentication;
using Giddy.Api.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAuthentication("Rejecting")
    .AddScheme<AuthenticationSchemeOptions, RejectingAuthenticationHandler>("Rejecting", null);
builder.Services.AddAuthorizationBuilder().SetFallbackPolicy(
    new AuthorizationPolicyBuilder("Rejecting")
        .RequireAuthenticatedUser()
        .Build());

var app = builder.Build();

app.UseMiddleware<SecurityHeadersMiddleware>();
app.MapGet("/health", () => Results.Ok(new { status = "ok" })).AllowAnonymous();
app.MapGet("/api/parties", () => Results.Ok(Array.Empty<object>()));

app.Run();

public partial class Program;
