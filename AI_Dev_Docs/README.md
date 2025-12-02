# Business Onboarder — Documentation Index

## What Is This?

A conversational AI app that helps founders articulate their brand foundation through natural dialogue. Instead of staring at blank forms asking for "value proposition," users just talk about their business—and the system infers, structures, and confirms.

**Core innovation:** Separation of analysis (free-form prose thinking) from parsing (structured extraction). GPT thinks better when it's not constrained to JSON.

---

## Documentation Map

Read in this order for full context:

### 1. Foundation
| Doc | Purpose | Read When |
|-----|---------|-----------|
| [01-PRD.md](./01-PRD.md) | Vision, user stories, scope, principles | First—understand what we're building |
| [02-database-schema.md](./02-database-schema.md) | Supabase tables, relationships, RLS | Before touching data layer |
| [03-field-definitions.md](./03-field-definitions.md) | All fields by bucket, types, examples | When working on any field-related feature |

### 2. Conversation System
| Doc | Purpose | Read When |
|-----|---------|-----------|
| [04-question-interaction-bank.md](./04-question-interaction-bank.md) | Questions, word banks, sliders, prompts | Building conversation content |
| [05-analyzer-prompts.md](./05-analyzer-prompts.md) | GPT prompts for each analyzer type | Working on analysis pipeline |
| [06-function-calling-schemas.md](./06-function-calling-schemas.md) | Schemas for parsing analyzer output | Working on parsing pipeline |
| [07-conversation-flow-spec.md](./07-conversation-flow-spec.md) | Flow controller, decision logic | Building conversation orchestration |

### 3. Interface & Architecture
| Doc | Purpose | Read When |
|-----|---------|-----------|
| [08-ui-ux-spec.md](./08-ui-ux-spec.md) | Components, layouts, interactions | Building any UI |
| [09-technical-architecture.md](./09-technical-architecture.md) | Tech stack, file structure, data flow | Setting up project, understanding system |

### 4. Features
| Doc | Purpose | Read When |
|-----|---------|-----------|
| [10-generated-outputs-spec.md](./10-generated-outputs-spec.md) | One-liners, benefit statements, briefs | Building output generation |
| [11-session-state-management.md](./11-session-state-management.md) | Session lifecycle, pause/resume, sync | Building session handling |

---

## Key Architectural Decisions

1. **Analyzers output prose, not JSON** — GPT infers better when thinking freely. Parsers extract structure separately.

2. **Not a state machine** — Fluid conversation with priority-based flow control. No rigid "you must answer this before that."

3. **Inference reveals** — System shows what it's picking up for user confirmation. Creates delight when accurate, easy fix when not.

4. **Modular everything** — New analyzers, fields, outputs, interactions can be added without refactoring core.

5. **~400 line file limit** — Keep files focused. Split when they grow.

---

## Quick Start for AI Dev

1. **Understand the vision** → Read PRD
2. **Set up Supabase** → Use database schema, run migrations
3. **Build chat UI** → Follow UI/UX spec, start with basic messages
4. **Add flow controller** → Implement conversation flow spec
5. **Wire up analyzers** → Add one analyzer at a time, test parsing
6. **Add interactions** → Word banks, sliders, inference reveals
7. **Build outputs** → Generate one-liners first, then expand

---

## File Structure (Target)

```
src/
├── app/                    # Next.js pages
├── components/
│   ├── chat/              # Chat UI components
│   ├── interactions/      # Word bank, slider, etc.
│   ├── progress/          # Side panel, bucket progress
│   └── dashboard/         # Foundation view
├── lib/
│   ├── supabase/          # DB client, types
│   ├── openai/
│   │   ├── analyzers/     # One file per analyzer
│   │   └── parsers/       # One file per parser
│   ├── flow/              # Classifier, decider, generator
│   └── outputs/           # Output generators
├── store/                 # Zustand stores
├── hooks/                 # React hooks
└── config/                # Buckets, fields, prompts
```

---

## Design Principles (Repeat for Emphasis)

- **Conversation first, structure second**
- **React > Generate** (give users something to respond to)
- **Progressive disclosure** (don't overwhelm)
- **Inference is a feature, not magic** (show your work)
- **Graceful incompleteness** (60% done is still valuable)
- **Delight in details** (micro-interactions matter)

---

## Open Questions

- [ ] Auth approach: Magic link? OAuth? Guest mode?
- [ ] Pricing model (future)
- [ ] Export formats for brand brief
- [ ] AI voice/personality customization

---

*Last updated: December 2024*
