# Business Onboarder — Product Requirements Document

## Overview

**Product Name:** Business Onboarder (working title)
**Purpose:** A conversational AI app that helps founders and solopreneurs articulate their brand foundation through natural dialogue—eliminating blank page syndrome by inferring insights from conversation rather than demanding structured input.

**Core Insight:** People know their business intuitively but struggle to articulate it in marketing-speak. Traditional forms ask for "value proposition" and get blank stares. But ask someone *why they started this thing* and they'll talk for twenty minutes. This app listens, infers, and structures—so the founder just has to be themselves.

---

## User Stories

### Primary User: The Founder

**As a founder/solopreneur, I want to...**

1. **Describe my business conversationally** so that I don't have to know marketing jargon to create a solid brand foundation.

2. **React to options instead of generating from scratch** so that I can make progress even when I don't know where to start.

3. **See what the system is inferring about my brand** so that I can confirm, correct, or refine its understanding.

4. **Pause and return later** so that I can fit this into my busy schedule without losing progress.

5. **Get usable outputs (one-liners, positioning statements, etc.)** so that I walk away with something I can actually use today.

6. **Edit and refine specific sections** so that I can improve areas that feel off without redoing everything.

7. **Understand what's complete vs. what needs more input** so that I know where to focus my energy.

### Secondary User: Future AI Apps

**As a downstream AI application, I want to...**

1. **Access a structured brand foundation via API** so that I can personalize my outputs without re-asking foundational questions.

2. **Know the confidence level of each field** so that I can decide whether to use the data or ask for clarification.

3. **Receive updates when the foundation changes** so that my outputs stay current.

---

## Success Criteria

### For Users
- Complete a usable brand foundation in 15-25 minutes
- Feel *understood*, not interrogated
- Leave with at least 3 actionable outputs they can use immediately
- Return rate: users come back to refine (indicates value)

### For the System
- 80%+ field completion rate for users who finish
- Inference accuracy: 70%+ of reveals confirmed without major edits
- Graceful handling of tangents and non-linear conversation

### For the Platform
- Clean data in Supabase that downstream apps can consume
- Modular analyzer system that can grow without refactoring core
- Session resumption works seamlessly

---

## Scope

### In Scope (MVP)
- Conversational chat interface with inline interactive elements
- Word banks, sliders, and binary choices as blank-page-syndrome relief
- 4-5 concurrent analyzers running on conversation chunks
- Function-calling parsers to structure analyzer outputs
- Supabase backend for sessions, fields, and user data
- Progress visualization (which buckets are complete)
- Inference reveal cards with confirm/reject/edit
- Basic generated outputs (one-liners, benefit statements)
- Session pause/resume
- Single-user, single-business per session

### Out of Scope (Future)
- Multi-business management per user
- Team collaboration / multiple contributors
- Custom analyzer creation by users
- White-label / embeddable version
- Direct integrations with other tools (Notion, etc.)
- Voice input
- Image/mood board selection

---

## Design Principles

### 1. Conversation First, Structure Second
The user should feel like they're talking to a smart friend who happens to be taking great notes—not filling out a form that sometimes talks.

### 2. React > Generate
Whenever possible, give users something to respond to. Choosing from options, adjusting sliders, confirming inferences—all easier than blank text fields.

### 3. Progressive Disclosure
Don't show the whole form. Surface what's relevant to the current moment. Let the structured view be optional/toggleable.

### 4. Inference is a Feature, Not Magic
When we infer something, we show it explicitly and ask for confirmation. The user should feel smart ("yes, that's exactly it!") not surveilled ("how did it know that?").

### 5. Graceful Incompleteness
A 60% complete foundation is still valuable. Don't punish users for not finishing everything. Show what's there, indicate what's missing, make it easy to fill gaps later.

### 6. Delight in the Details
Micro-interactions matter. A word bank that feels satisfying to click. Progress that animates smoothly. Copy that has personality. This is a brand-building tool—it should itself have good brand energy.

---

## Technical Constraints

- **File size:** No single code file over ~400 lines. Modularity over monoliths.
- **AI costs:** GPT-4o-mini for analyzers (cost-effective, good at inference). Batch where possible.
- **Real-time:** User-facing responses should feel instant. Analysis can be async.
- **Offline:** Not required for MVP, but session state should survive connection drops.

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Analyzers produce inconsistent/bad inferences | Multiple analyzers cross-check; user confirmation before committing |
| Users get frustrated with chat (want to "just fill a form") | Offer "quick mode" or direct-edit escape hatches |
| Conversation goes off-rails / too long | Soft guardrails, progress nudges, "we have enough to continue" signals |
| Cold start—first message is still blank page | Starter prompts, example responses, low-pressure opener |

---

## Future Extensibility

This is the first "onboarder" in a planned family. Architecture should support:

- **New analyzer types** — plug-in pattern, each analyzer is self-contained
- **New field buckets** — schema-driven, not hardcoded
- **New output generators** — same pattern as analyzers
- **New interaction types** — component library, not one-offs
- **Cross-onboarder data sharing** — common user profile, business-specific extensions

---

## Open Questions

1. **Authentication:** Email magic link? OAuth? Guest mode with claim-later?
2. **Pricing model:** Free tier limits? Per-business? Subscription?
3. **Data ownership:** Easy export? Delete account = delete all data?
4. **Tone of the AI:** Warm and encouraging? Crisp and efficient? User-selectable?

---

*Document version: 1.0*
*Last updated: [Date]*
*Author: [Name]*
