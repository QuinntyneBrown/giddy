using FluentValidation;
using Giddy.Application.Common;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Giddy.Api.Errors;

/// <summary>
/// Turns exceptions into RFC 7807 problem responses. Unexpected failures are logged with a
/// reference code the parent can quote; no internals are returned.
/// </summary>
public sealed class GiddyExceptionHandler(IProblemDetailsService problemDetails, ILogger<GiddyExceptionHandler> logger)
    : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        ProblemDetails problem = exception switch
        {
            ValidationException validation => new ValidationProblemDetails(
                validation.Errors
                    .GroupBy(e => JsonName(e.PropertyName))
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray()))
            {
                Title = "Some details need fixing.",
                Status = StatusCodes.Status400BadRequest,
            },
            Giddy.Application.Rsvps.RsvpLinkNotWorkingException notWorking => new ProblemDetails { Title = notWorking.Message, Status = StatusCodes.Status404NotFound },
            Giddy.Application.Guests.Import.InvalidImportFileException invalidFile => new ProblemDetails { Title = invalidFile.Message, Status = StatusCodes.Status400BadRequest },
            NotFoundException => new ProblemDetails { Title = "We couldn’t find that.", Status = StatusCodes.Status404NotFound },
            EmailUnverifiedException unverified => new ProblemDetails
            {
                Title = unverified.Message,
                Status = StatusCodes.Status403Forbidden,
                Extensions = { ["code"] = "email-unverified" },
            },
            ForbiddenException => new ProblemDetails { Title = "You don’t have permission to do that.", Status = StatusCodes.Status403Forbidden },
            Giddy.Application.Venues.AvailabilityUnavailableException => new ProblemDetails { Title = "We couldn’t check venue availability right now. Your filters are kept; try again in a moment.", Status = StatusCodes.Status503ServiceUnavailable },
            Giddy.Application.Bookings.PaymentDeclinedException declined => new ProblemDetails { Title = declined.Message, Status = StatusCodes.Status402PaymentRequired },
            Giddy.Application.Bookings.BookingNotCompletedException notCompleted => new ProblemDetails { Title = notCompleted.Message, Status = StatusCodes.Status502BadGateway },
            Giddy.Application.Bookings.SlotUnavailableException unavailable => new ProblemDetails
            {
                Title = unavailable.Message,
                Status = StatusCodes.Status409Conflict,
                Extensions = { ["alternatives"] = unavailable.Alternatives },
            },
            Giddy.Application.Checklist.Tasks.TaskChangedException changed => new ProblemDetails
            {
                Title = changed.Message,
                Status = StatusCodes.Status412PreconditionFailed,
                Extensions = { ["current"] = changed.Current },
            },
            Giddy.Application.Accounts.SignIn.WrongCredentialsException wrong => new ProblemDetails
            {
                Title = wrong.Message,
                Detail = "Check for typos, or reset your password. After 5 tries we pause sign-in for 15 minutes to keep your account safe.",
                Status = StatusCodes.Status401Unauthorized,
            },
            Giddy.Application.Accounts.SignIn.SignInPausedException paused => new ProblemDetails
            {
                Title = paused.Message,
                Detail = "Try again later, or reset your password to sign in now.",
                Status = StatusCodes.Status423Locked,
            },
            Giddy.Application.Accounts.LinkExpiredException expired => new ProblemDetails
            {
                Title = expired.Message,
                Status = StatusCodes.Status410Gone,
                Extensions = { ["email"] = expired.Email },
            },
            Giddy.Application.Accounts.TooSoonException tooSoon => new ProblemDetails
            {
                Title = tooSoon.Message,
                Status = StatusCodes.Status429TooManyRequests,
                Extensions = { ["retryAfterSeconds"] = tooSoon.RetryAfterSeconds },
            },
            Giddy.Application.Accounts.EmailNotSentException notSent => new ProblemDetails
            {
                Title = notSent.Message,
                Detail = "Our email service didn’t respond. Your request wasn’t sent; try again in a moment.",
                Status = StatusCodes.Status502BadGateway,
            },
            ConflictException conflict => new ProblemDetails { Title = conflict.Message, Status = StatusCodes.Status409Conflict },
            _ => Unexpected(exception),
        };

        context.Response.StatusCode = problem.Status!.Value;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = problem,
            Exception = exception,
        });
    }

    private ProblemDetails Unexpected(Exception exception)
    {
        var referenceCode = ReferenceCode.Create();
        logger.LogError(exception, "Unhandled exception {ReferenceCode}", referenceCode);
        return new ProblemDetails
        {
            Title = "Something went wrong on our side. Your plans are safe.",
            Status = StatusCodes.Status500InternalServerError,
            Extensions = { ["referenceCode"] = referenceCode },
        };
    }

    private static string JsonName(string propertyName) =>
        string.IsNullOrEmpty(propertyName) ? propertyName : char.ToLowerInvariant(propertyName[0]) + propertyName[1..];
}
