using Giddy.Infrastructure;
using Giddy.Infrastructure.Persistence;
using Giddy.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

// Database administration for Giddy. The API never migrates on startup; run this instead.
//   dotnet run --project src/Giddy.Cli -- migrate
//   dotnet run --project src/Giddy.Cli -- seed
var command = args.FirstOrDefault();
if (command is not ("migrate" or "seed"))
{
    Console.Error.WriteLine("Usage: giddy <migrate|seed>");
    return 1;
}

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddInfrastructure(builder.Configuration);
using var host = builder.Build();
using var scope = host.Services.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<GiddyDbContext>();

if (command == "migrate")
{
    await db.Database.MigrateAsync();
    Console.WriteLine("Database is up to date.");
}
else
{
    await new DemoDataSeeder(db).SeedAsync(CancellationToken.None);
    Console.WriteLine("Demo data is in place.");
}

return 0;
