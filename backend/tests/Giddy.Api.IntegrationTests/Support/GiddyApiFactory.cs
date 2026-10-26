using System.Net.Http.Json;
using Giddy.Application.Agent.Model;
using Giddy.Application.Bookings;
using Giddy.Application.Common;
using Giddy.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using NodaTime;
using NodaTime.Testing;

namespace Giddy.Api.IntegrationTests.Support;

/// <summary>
/// Hosts the real API with a fake database, a fake clock and a test sign-in scheme.
/// Each factory gets its own in-memory database.
/// </summary>
public sealed class GiddyApiFactory : WebApplicationFactory<Program>
{
    private readonly string databaseName = $"giddy-{Guid.NewGuid()}";

    /// <summary>Starts at 4:00 pm in Toronto on Sun 25 Oct 2026.</summary>
    public FakeClock Clock { get; } = new(Instant.FromUtc(2026, 10, 25, 20, 0));

    public const string EmailEventsSecret = "test-email-events-secret";

    public ScriptedPlanningModel Model { get; } = new();

    public FakePaymentGateway Payments { get; } = new();

    public FakeEmailSender Email { get; } = new();

    public FakeSmsSender Sms { get; } = new();

    public FakeVendorDirectory Vendors { get; } = new();

    public const string VendorQuotesSecret = "test-vendor-quotes-secret";

    public FakeVenuePartner Partner => partner ??= new FakeVenuePartner(Clock);

    private FakeVenuePartner? partner;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Giddy", "Server=unused;Database=unused");
        builder.UseSetting("Giddy:EmailEventsSecret", EmailEventsSecret);
        builder.UseSetting("Giddy:VendorQuotesSecret", VendorQuotesSecret);
        if (Environment.GetEnvironmentVariable("GIDDY_TEST_LOG") is { } logFile)
        {
            builder.ConfigureLogging(logging => logging.AddProvider(new FileLoggerProvider(logFile)));
        }

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<GiddyDbContext>>();
            services.RemoveAll(typeof(IDbContextOptionsConfiguration<GiddyDbContext>));
            services.AddDbContext<GiddyDbContext>(options => options.UseInMemoryDatabase(databaseName));

            // Tests run reminders themselves, at the times they set on the clock.
            services.Remove(services.Single(d => d.ImplementationType == typeof(Giddy.Infrastructure.Notifications.TaskReminderWorker)));
            services.RemoveAll<IClock>();
            services.AddSingleton<IClock>(Clock);

            services.RemoveAll<IPlanningModel>();
            services.AddSingleton<IPlanningModel>(Model);

            services.RemoveAll<IPaymentGateway>();
            services.AddSingleton<IPaymentGateway>(Payments);
            services.RemoveAll<IVenuePartner>();
            services.AddSingleton<IVenuePartner>(_ => Partner);
            services.RemoveAll<IEmailSender>();
            services.AddSingleton<IEmailSender>(Email);
            services.RemoveAll<Giddy.Application.Guests.Import.IMalwareScanner>();
            services.AddSingleton<Giddy.Application.Guests.Import.IMalwareScanner, FakeMalwareScanner>();
            services.RemoveAll<Giddy.Application.Vendors.IVendorDirectory>();
            services.AddSingleton<Giddy.Application.Vendors.IVendorDirectory>(Vendors);
            services.RemoveAll<ISmsSender>();
            services.AddSingleton<ISmsSender>(Sms);

            services.AddAuthentication()
                .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>(TestAuthenticationHandler.Scheme, null);
            services.PostConfigure<AuthenticationOptions>(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthenticationHandler.Scheme;
                options.DefaultChallengeScheme = TestAuthenticationHandler.Scheme;
                options.DefaultForbidScheme = TestAuthenticationHandler.Scheme;
            });
        });
    }

    public async Task SeedAsync(Action<GiddyDbContext> seed)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<GiddyDbContext>();
        seed(db);
        await db.SaveChangesAsync();
    }

    public async Task<T> QueryAsync<T>(Func<GiddyDbContext, Task<T>> query)
    {
        using var scope = Services.CreateScope();
        return await query(scope.ServiceProvider.GetRequiredService<GiddyDbContext>());
    }

    public HttpClient CreateClientFor(TestParent parent)
    {
        var client = CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true, BaseAddress = new Uri("https://localhost") });
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.Header, parent.HeaderValue);
        return client;
    }

    /// <summary>A signed-in client that has fetched the anti-forgery token, as the web app does.</summary>
    public async Task<HttpClient> CreateBrowserClientFor(TestParent parent)
    {
        var client = CreateClientFor(parent);
        var token = await client.GetFromJsonAsync<AntiforgeryTokenResponse>("/api/antiforgery");
        client.DefaultRequestHeaders.Add("X-XSRF-TOKEN", token!.Token);
        return client;
    }

    private sealed record AntiforgeryTokenResponse(string Token);
}
