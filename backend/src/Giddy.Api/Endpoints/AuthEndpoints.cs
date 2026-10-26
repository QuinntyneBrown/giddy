using Giddy.Api.Authentication;
using Giddy.Api.Security;
using Giddy.Application.Accounts.External;
using Giddy.Application.Accounts.Reset;
using Giddy.Application.Accounts.SignIn;
using Giddy.Application.Accounts.SignOut;
using Giddy.Application.Accounts.SignUp;
using Giddy.Application.Accounts.Verify;
using MediatR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace Giddy.Api.Endpoints;

/// <summary>Accounts: sign-up, confirming the email, signing in and out, and resetting the password.</summary>
public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        // Open to visitors, and limited to 10 requests a minute from one address.
        var auth = app.MapGroup("/api/auth").AllowAnonymous().RequireRateLimiting(RateLimitSetup.Auth);

        auth.MapPost("/sign-up", async (SignUpRequest request, ISender sender, CancellationToken cancel) =>
        {
            var signedUp = await sender.Send(new SignUpCommand(request.FirstName ?? string.Empty, request.Email ?? string.Empty, request.Password ?? string.Empty, request.PostalCode ?? string.Empty, request.Marketing), cancel);
            return Results.Created("/api/session", signedUp);
        });

        auth.MapPost("/verify", async (TokenRequest request, HttpContext context, ISender sender, CancellationToken cancel) =>
        {
            var signedIn = await sender.Send(new VerifyEmailCommand(request.Token ?? string.Empty, DeviceNames.Describe(context.Request.Headers.UserAgent)), cancel);
            await SessionCookie.SignInAsync(context, signedIn);
            return Results.Ok(new { name = signedIn.Name });
        });

        auth.MapPost("/verify/resend", async (EmailRequest request, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new ResendVerificationCommand(request.Email ?? string.Empty), cancel);
            return Results.Accepted();
        });

        auth.MapPost("/sign-in", async (SignInRequest request, HttpContext context, ISender sender, CancellationToken cancel) =>
        {
            var signedIn = await sender.Send(
                new SignInCommand(
                    request.Email ?? string.Empty,
                    request.Password ?? string.Empty,
                    request.KeepSignedIn,
                    DeviceNames.Describe(context.Request.Headers.UserAgent),
                    DeviceNames.Locate(context.Request)),
                cancel);
            await SessionCookie.SignInAsync(context, signedIn);
            return Results.Ok(new { name = signedIn.Name });
        });

        app.MapPost("/api/auth/sign-out", async (HttpContext context, ISender sender, CancellationToken cancel) =>
        {
            if (Guid.TryParse(context.User.FindFirst(SessionCookie.SessionClaim)?.Value, out var sessionId))
            {
                await sender.Send(new SignOutCommand(sessionId), cancel);
            }

            await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.NoContent();
        });

        auth.MapPost("/password/forgot", async (EmailRequest request, ISender sender, CancellationToken cancel) =>
        {
            await sender.Send(new ForgotPasswordCommand(request.Email ?? string.Empty), cancel);
            return Results.Accepted();
        });

        auth.MapGet("/password/reset/{token}", (string token, ISender sender, CancellationToken cancel) =>
            sender.Send(new CheckResetLinkQuery(token), cancel));

        auth.MapPost("/password/reset", async (ResetPasswordRequest request, HttpContext context, ISender sender, CancellationToken cancel) =>
        {
            var signedIn = await sender.Send(
                new ResetPasswordCommand(request.Token ?? string.Empty, request.Password ?? string.Empty, request.Confirm ?? string.Empty, DeviceNames.Describe(context.Request.Headers.UserAgent)),
                cancel);
            await SessionCookie.SignInAsync(context, signedIn);
            return Results.Ok(new { name = signedIn.Name });
        });

        // The browser navigates here, so failures come back to the sign-in page rather than as JSON.
        auth.MapGet("/external/{provider}", async (string provider, string? returnUrl, HttpContext context, IExternalSignIn external) =>
        {
            if (!external.IsAvailable(provider))
            {
                return Results.Redirect("/sign-in?error=provider");
            }

            await external.ChallengeAsync(context, provider, $"/api/auth/external/callback?returnUrl={Uri.EscapeDataString(LocalPath(returnUrl))}");
            return Results.Empty;
        });

        auth.MapGet("/external/callback", async (string? returnUrl, HttpContext context, IExternalSignIn external, ISender sender, CancellationToken cancel) =>
        {
            var identity = await external.ReadAsync(context);
            await external.ForgetAsync(context);
            if (identity is null || !identity.EmailVerified)
            {
                return Results.Redirect("/sign-in?error=provider");
            }

            var signedIn = await sender.Send(
                new ExternalSignInCommand(identity.Provider, identity.Email, identity.Name, identity.EmailVerified, DeviceNames.Describe(context.Request.Headers.UserAgent)),
                cancel);
            await SessionCookie.SignInAsync(context, signedIn);
            return Results.Redirect(signedIn.IsNew ? "/welcome" : LocalPath(returnUrl));
        });

        return app;
    }

    /// <summary>Only paths in the web app, never another site.</summary>
    private static string LocalPath(string? url) =>
        url is { Length: > 0 } && url.StartsWith('/') && !url.StartsWith("//", StringComparison.Ordinal) && !url.StartsWith("/\\", StringComparison.Ordinal) ? url : "/";
}
