using System.Net;
using System.Text.Json;

namespace RecruitFlow.API.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try { await next(context); }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception non gérée: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var (statusCode, message) = ex switch
        {
            KeyNotFoundException        => (HttpStatusCode.NotFound,          ex.Message),
            InvalidOperationException   => (HttpStatusCode.BadRequest,        ex.Message),
            UnauthorizedAccessException => (HttpStatusCode.Forbidden,         ex.Message),
            _                           => (HttpStatusCode.InternalServerError, "Erreur interne")
        };
        context.Response.ContentType = "application/json";
        context.Response.StatusCode  = (int)statusCode;
        return context.Response.WriteAsync(JsonSerializer.Serialize(new { status = (int)statusCode, message, timestamp = DateTime.UtcNow }));
    }
}
