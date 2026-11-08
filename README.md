# Giddy

[![CI](https://github.com/QuinntyneBrown/giddy/actions/workflows/ci.yml/badge.svg)](https://github.com/QuinntyneBrown/giddy/actions/workflows/ci.yml)
![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4)
![Angular 22](https://img.shields.io/badge/Angular-22-DD0031)
![WCAG 2.2 AA](https://img.shields.io/badge/accessibility-WCAG%202.2%20AA-0A7F3F)

Giddy is an agentic birthday planner for kids' parties in Toronto and the Greater Toronto Area (GTA). Parents describe the party they want, and Giddy finds venues, entertainers, food and cake that are actually available, proposes a priced plan, and then helps them run it: invitations and RSVPs, the guest list, the budget, a dated checklist, a party-day run sheet that works offline, and thank-you notes afterwards.

Giddy is a responsive web application with an ASP.NET Core API and an Angular progressive web app.

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Run the API](#run-the-api)
  - [Run the web app](#run-the-web-app)
- [Testing](#testing)
- [Documentation](#documentation)
- [How we build](#how-we-build)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Features

| Journey | What a parent can do |
|---|---|
| Chat with Giddy | Describe the party in chat; Giddy searches real availability, proposes a validated plan, remembers preferences and applies changes only after confirmation. |
| Start a party plan | Create a party for a child and follow its overview, countdown and readiness from home. |
| Find, compare and book venues | Search GTA venues by date, capacity and area, compare up to three, hold a slot and pay the deposit. |
| Invitations and RSVPs | Design and send invitations; guests reply without an account; RSVPs, reminders and allergies update live. |
| Guest list | Add, import, search, filter and remove guests, with an allergy tally and undo. |
| Entertainers, food and cake | Search vendors by category and theme, check allergy fit and request quotes. |
| Themes and budget | Choose an age-appropriate theme; track planned and paid spend and swap items when over budget. |
| Checklist and party day | Work a generated, dated task list shared with co-planners, then follow a timed run sheet offline. |
| Family and account | Sign up, add children, get birthday reminders, share or delete plans, export or delete data. |
| Wrap up | Send thank-you notes, rate providers and save the party as a reusable template. |

The full list of journeys, with effort, is in [`docs/journeys.md`](docs/journeys.md).

## Architecture

- **Giddy Web**: an Angular single-page application and installable PWA. Every screen is composed from a single shared components library (`@giddy/components`) that implements the design system once.
- **Giddy API**: ASP.NET Core in clean-architecture layers. Endpoints dispatch MediatR commands and queries to application handlers; handlers act on domain aggregates persisted with EF Core on SQL Server. Endpoints require authentication by default and every query enforces permissions on the server.
- **Planning Agent**: a tool-using conversation loop against the Anthropic Claude API. It calls the API's internal tool endpoints with a family-scoped token and never books, pays or sends messages itself.
- **CLI**: applies database migrations and idempotent seed data. The API never migrates on startup.

Design decisions and the system context, container and sequence diagrams are in [`docs/detailed-designs/`](docs/detailed-designs/README.md).

## Repository layout

```text
backend/     ASP.NET Core API, domain, application, infrastructure, CLI and integration tests (Giddy.slnx)
frontend/    Angular workspace: app shell plus the components, api, core and feature libraries; Playwright e2e
docs/
  specs/              L1 high-level and L2 detailed requirements with acceptance criteria
  detailed-designs/   One design per feature slice, with PlantUML diagrams
  mocks/              Static HTML mocks for every screen in every state
  design-system/      Tokens, foundations, components and patterns
  estimates/          Effort and percent complete per subsystem
  journeys.md         The user journeys that drive delivery
tools/       Scripts for recording and building the demo videos
.github/     CI workflow and Copilot instructions
```

Each half of the stack has its own README: [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md).

## Getting started

### Prerequisites

| Tool | Version |
|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 10.0 |
| [Node.js](https://nodejs.org/) | 24 |
| npm | 11 |
| SQL Server | Any edition reachable by a connection string (not needed for tests) |

### Run the API

```sh
cd backend
export ConnectionStrings__Giddy="Server=localhost;Database=Giddy;Trusted_Connection=True;TrustServerCertificate=True"
dotnet run --project src/Giddy.Cli -- migrate
dotnet run --project src/Giddy.Cli -- seed     # idempotent, safe to re-run
dotnet run --project src/Giddy.Api
```

### Run the web app

```sh
cd frontend
npm ci
npm start                 # http://localhost:4200
```

Proxy `/api` from the dev server to the running API, or run the Playwright suite, which needs no backend at all.

## Testing

| Suite | Command | Notes |
|---|---|---|
| API integration tests | `dotnet test backend/Giddy.slnx` | Hosts the real API against an in-memory database with a fake clock and sign-in scheme. No Docker. |
| Lint and format | `npm run lint` and `npm run format:check` in `frontend/` | ESLint with template accessibility rules, Stylelint and Prettier. CI fails on either. |
| End-to-end | `npx playwright test` in `frontend/` | Chromium only. Every HTTP call is answered by the fake API in `e2e/fixtures/`; an unrouted request fails the test. Axe runs on every screen. |
| Design-system contrast | See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Verifies every token pair meets WCAG 2.2 AA. |

CI runs all of the above on every pull request and on pushes to `main`.

## Documentation

| Document | Purpose |
|---|---|
| [Requirements (L1)](docs/specs/L1.md) and [L2](docs/specs/L2.md) | What the system shall do, with acceptance criteria |
| [Detailed designs](docs/detailed-designs/README.md) | Architecture and one design per feature slice |
| [Mocks](docs/mocks/README.md) | Every page, dialog and notification in every state, light and dark |
| [Design system](docs/design-system/README.md) | Tokens, components, patterns and accessibility rules |
| [Estimates](docs/estimates/README.md) | Effort, progress and roadmap |
| [Agent instructions](AGENTS.md) | Conventions coding agents and contributors must follow |

Open `docs/mocks/index.html` or `docs/design-system/index.html` in a browser to explore the design artifacts.

## How we build

Giddy is specification-driven and delivered in thin slices with acceptance test-driven development:

1. Every behavior change starts with a requirement, a detailed design and a mock.
2. Each slice gets Given-When-Then criteria and a failing acceptance test before any production code.
3. Only the code that satisfies the slice is written, then refactored with tests green.
4. UI is composed exclusively from the shared components library; business rules live in handlers and domain services, never in endpoints.

The full set of rules is in [`AGENTS.md`](AGENTS.md).

## Contributing

Contributions are welcome. Before opening a pull request:

1. Read [`AGENTS.md`](AGENTS.md) and the relevant design under `docs/detailed-designs/`.
2. Branch from `main` and keep changes small and focused on one slice.
3. Make sure `dotnet test backend/Giddy.slnx`, `npm run lint`, `npm run format:check`, `npm run build` and `npx playwright test` pass locally.
4. Keep the specs, designs, mocks and the e2e fake API in step with the code in the same change.

Please open an issue first for anything larger than a bug fix so the design can be agreed before implementation.

## Security

Giddy handles children's names, birthdays and allergy information. Please do not report security vulnerabilities through public issues. Email the maintainer listed on the [GitHub repository](https://github.com/QuinntyneBrown/giddy) with a description of the issue and steps to reproduce, and allow a reasonable time for a fix before disclosure.

## License

This repository does not yet include a license. All rights are reserved by the author until one is added.
