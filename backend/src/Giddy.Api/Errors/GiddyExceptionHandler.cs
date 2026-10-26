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
            NotFoundException => new ProblemDetails { Title = "We couldn’t find that.", Status = StatusCodes.Status404NotFound },
            ForbiddenException => new ProblemDetails { Title = "You don’t have permission to do that.", Status = StatusCodes.Status403Forbidden },
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
