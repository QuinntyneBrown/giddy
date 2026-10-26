# Propose a priced plan

## Overview

Giddy's main output is a *plan proposal*: a theme, venue, entertainer, cake, food and loot bags, each with a tax-inclusive price, and a total against the budget. Proposals come only from live tool results, never from the model's general knowledge, and respect every recorded allergy.

This feature also covers how Giddy answers follow-ups with alternatives and how it stays safe: grounding, refusing prompt injection, declining off-topic requests and logging every turn for review.

- **plan proposal** — structured object rendered as the plan card, built from tool results and returned as a `propose_plan` tool call
- **grounding** — rule that every price, availability and vendor fact in a reply comes from this turn's tool results
- **prompt injection** — text, including text inside vendor listings or reviews, that tries to change Giddy's instructions

This feature belongs to the **Planning agent** subsystem. It is designed from the screens in [`docs/mocks`](../../../mocks/README.md) and the L2 requirements listed below.

## Description

The feature is a vertical slice from the Angular web application through the Giddy API to storage and any external services.

**Planning Agent**

- **`ProposePlanTool`** — Tool whose input is the plan card as catalogue IDs; names and tax-inclusive prices are filled in from the catalogue, never from the model, and `ProposalValidator` checks it before it reaches the parent.
- **`ProposalValidator`** — Rejects proposals whose items are missing from this turn's tool results, are unavailable for the slot, outside the area, over capacity, or conflict with allergies without a flag.
- **`AllergyGuard`** — Reads the party's allergy list and annotates each food and venue option with compatibility.
- **`ToolResultSanitizer`** — Wraps third-party text (listings, reviews) as quoted data and strips instruction-like content before it reaches the model.
- **`TopicPolicy`** — System-prompt rules that decline off-topic or unsafe requests; a model `refusal` stop is answered with a polite steer back to planning.
- **`TurnLogger`** — Stores prompts, tool calls and results with the party ID for 90 days, excluding payment data.

**Frontend (Giddy Web)**

- **`PlanCard`** — Dashed accent card with rows, prices, total badge, Use this plan and Swap something.
- **`SuggestionChips`** — Up to four suggested replies.


**Open points**

- A separate off-topic classifier is not used yet; the system prompt and the model's own refusals cover it.
- Turn logs live in the `TurnLogs` table with the party ID; `TurnLogRetentionWorker` deletes entries older than 90 days daily.

## Requirements

The feature realizes the following level-2 (L2) requirements. Each L2 requirement refines the level-1 (L1) requirement cited beside it; the full acceptance criteria are in [`docs/specs/L2.md`](../../../specs/L2.md).

| L2 ID | Refines (L1) | Requirement |
|-------|--------------|-------------|
| `L2-017` | `L1-004` | **Propose a priced plan.** Given a parent has given at least the child's age, date, approximate guest count, budget and area, when Giddy proposes a plan, then the plan card lists theme, venue (with time slot, capacity and relevant features), entertainer, cake, food and loot bags, each with a tax-inclusive price, and a total compared with the budget. |
| `L2-019` | `L1-004` | **Agent follow-ups and suggestions.** Given a proposal exists, when the parent asks for a change (for example a gluten-free cake), then Giddy answers with the specific alternative, its price difference and any related changes it recommends. |
| `L2-022` | `L1-004` | **Agent safety and grounding.** Given any prices, availability or vendor facts in a Giddy reply, when they are shown, then they come from Giddy's tool results for this request, not from the model's general knowledge. |

## Diagrams

### System context

Giddy grounds proposals in live venue and vendor data and uses the Claude API to compose them.

![C4 system context: Propose a priced plan](diagrams/c4-context.png)

### Containers

Availability and vendor data reach the agent through the API's tool endpoints, which cache venue availability for at most 15 minutes.

![C4 container view: Propose a priced plan](diagrams/c4-container.png)

### Components

The proposal is produced as a structured tool call and shall pass `ProposalValidator` before the parent sees it.

![C4 component view: Propose a priced plan](diagrams/c4-component.png)

### Class structure

Each `PlanItem` records the tool call it came from, which is how grounding is checked.

![Class diagram: Propose a priced plan](diagrams/class-structure.png)

### Behaviour — build and validate a plan

Every item in the proposal shall point at a tool call from this turn; the validator rejects ungrounded, unavailable or allergy-conflicting items and asks the model to retry once before falling back to an explanation (`L2-017`, `L2-022`).

![Sequence diagram: Propose — build and validate a plan](diagrams/sequence-propose.png)

### Behaviour — refuse an injected instruction

Instructions found in tool results are treated as data; Giddy never reveals another family's data or acts without confirmation (`L2-022`).

![Sequence diagram: Propose — refuse an injected instruction](diagrams/sequence-injection.png)
