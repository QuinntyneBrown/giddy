# 02 · Chat with Giddy

> **Runtime:** ~4 min · **Audience:** contributors and product owners · **Prerequisites:** [01 · Set up the foundation](../01-set-up-the-foundation/README.md)

**Video:** [02-chat-with-giddy.mp4](02-chat-with-giddy.mp4) · [Slides](slides.html) · **Audio:** [02-chat-with-giddy.mp3](02-chat-with-giddy.mp3) · [Transcript](script.md)

## Why this video exists

Journey 02 ([prompt](../../prompts/02-chat-with-giddy.md)) delivers the planning agent: conversation, visible progress, grounded priced proposals, confirmation before any change, and family memories (L2-015 to L2-022, L2-066).

## Learning objectives

By the end, the viewer can:

- describe what a parent sees from the first message to a saved plan;
- explain how a plan's prices and availability are grounded in the server's data;
- say what Stop, Send again, Edit message and "Giddy can't answer right now" do;
- explain where memories live, who can see them and how they are forgotten.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Can Giddy invent a venue or a price? | No: proposals are catalogue IDs from this turn's tool results; the server fills names and prices and rejects anything unavailable, out of area or too small |
| What does Giddy do on its own? | Searches and prepares; it has no tool to book, pay, send or contact anyone |
| What happens on Stop? | The turn is cancelled within a second and finished steps stay |
| Who sees a memory? | Only its family; forgetting deletes it and the next turn no longer reads it |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/Giddy.Application/Agent/AgentLoop.cs` | the tool loop, steps and failures |
| `backend/src/Giddy.Application/Agent/ProposalValidator.cs` | grounding, date, area, capacity, allergies |
| `backend/src/Giddy.Application/Agent/ToolResultSanitizer.cs` | quoted third-party text |
| `backend/src/Giddy.Infrastructure/Agent/ClaudePlanningModel.cs` | the Anthropic SDK adapter |
| `frontend/projects/planner/` | the chat page and accept-plan dialog |
| `clips/*.mp4` | desktop plan, phone stop and suggestions, recovery, forgetting a memory |
| `shots/*.png` | greeting, thinking, failed save, settings |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:35 | Introduction, promises | What the conversation guarantees |
| 00:35-01:30 | From a sentence to a plan | Starter chip, steps, plan card, at a glance |
| 01:30-02:00 | Confirmation | The dialog, nothing booked, bottom sheet |
| 02:00-02:40 | Grounded and safe | Server-filled prices, validation, sanitising, no action tools, logs |
| 02:40-03:15 | Stop and failures | Stop, suggestions, Send again, provider down |
| 03:15-03:40 | Memories | Family scope, Forget |
| 03:40-04:10 | Tests, recap | Scripted model, fake API, axe |

## Demo commands

```sh
dotnet test backend/Giddy.slnx
cd frontend && npx playwright test planner-chat settings
# Live model (needs ANTHROPIC_API_KEY): run the API with a database
dotnet run --project backend/src/Giddy.Cli -- migrate && dotnet run --project backend/src/Giddy.Cli -- seed
dotnet run --project backend/src/Giddy.Api
```

## Pitfalls

- The live Claude adapter needs `ANTHROPIC_API_KEY`; tests and recordings use a scripted model and the fake API.
- Turns run in the API process and the page polls their events; a separate worker and push updates are a later scaling step.
- Until families exist (journey 13), a memory belongs to the parent who stated it.

## References

- [Anthropic tool use](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [Angular CDK Dialog](https://material.angular.dev/cdk/dialog/overview)
- [WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
