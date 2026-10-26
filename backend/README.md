# Giddy API

ASP.NET Core API in clean-architecture layers:

| Project | Role |
|---|---|
| `Giddy.Domain` | Aggregates (`Party`), Toronto calendar, postal codes and the GTA service area |
| `Giddy.Application` | MediatR queries and commands; party authorisation and validation behaviours |
| `Giddy.Infrastructure` | EF Core (`GiddyDbContext`, migrations), seed data, clock |
| `Giddy.Api` | Endpoints, cookie authentication, anti-forgery, security headers, problem details |
| `Giddy.Cli` | `migrate` and `seed`; the API never migrates on startup |

## Commands

```sh
dotnet test Giddy.slnx
export ConnectionStrings__Giddy="Server=...;Database=Giddy;..."
dotnet run --project src/Giddy.Cli -- migrate
dotnet run --project src/Giddy.Cli -- seed     # idempotent
dotnet run --project src/Giddy.Api
dotnet tool restore && dotnet ef migrations add <Name> --project src/Giddy.Infrastructure --output-dir Persistence/Migrations
```

Integration tests host the real API with an in-memory database, a fake clock (4:00 pm, Sun 25 Oct 2026 in Toronto) and a test sign-in scheme.
