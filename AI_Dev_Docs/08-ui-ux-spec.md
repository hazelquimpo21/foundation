# Business Onboarder — UI/UX Specification

## Overview

A chat-first interface with inline interactive elements and an optional side panel showing field progress. Designed to feel like a conversation, not a form.

---

## Design Principles

1. **Conversation is primary** — Chat dominates the viewport
2. **Progress is ambient** — Visible but not distracting
3. **Interactions are inline** — Word banks, sliders appear in chat flow
4. **Delight in details** — Smooth animations, satisfying micro-interactions
5. **Mobile-first** — Works great on phone, expands gracefully on desktop

---

## Color & Typography

### Colors (CSS Variables)

```css
:root {
  /* Primary */
  --color-primary: #6366f1;        /* Indigo - interactive elements */
  --color-primary-hover: #4f46e5;
  --color-primary-light: #e0e7ff;
  
  /* Neutrals */
  --color-bg: #fafafa;
  --color-surface: #ffffff;
  --color-border: #e5e5e5;
  --color-text: #171717;
  --color-text-secondary: #737373;
  
  /* Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  /* Chat specific */
  --color-user-bubble: var(--color-primary);
  --color-user-text: #ffffff;
  --color-assistant-bubble: #f5f5f5;
  --color-assistant-text: var(--color-text);
  
  /* Progress */
  --color-progress-empty: #e5e5e5;
  --color-progress-partial: #fbbf24;
  --color-progress-complete: var(--color-success);
}
```

### Typography

```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

---

## Page: Welcome / Entry

### Purpose
Low-commitment entry point. Set expectations, provide options.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                          [Logo]                             │
│                                                             │
│                    Build Your Brand                         │
│                      Foundation                             │
│                                                             │
│           Have a conversation about your business.          │
│         Walk away with clarity on who you are,              │
│              who you serve, and how to talk about it.       │
│                                                             │
│                   ⏱️ Takes 15-20 minutes                    │
│                                                             │
│              ┌─────────────────────────┐                    │
│              │     Let's Begin →       │                    │
│              └─────────────────────────┘                    │
│                                                             │
│                 ─── or ───                                  │
│                                                             │
│              [ Continue previous session ]                  │
│              [ Import from URL ]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Interactions
- **Primary CTA:** Starts new session, goes to conversation
- **Continue:** Shows session picker if multiple, otherwise resumes
- **Import:** Opens URL input modal (future feature)

---

## Page: Conversation (Main Interface)

### Layout — Desktop

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]                              Foundation Studio       [≡ Menu]   │
├───────────────────────────────────────────────────────┬─────────────────┤
│                                                       │                 │
│  ┌─────────────────────────────────────────────────┐ │  YOUR           │
│  │                                                  │ │  FOUNDATION     │
│  │                                                  │ │                 │
│  │           CONVERSATION AREA                      │ │  ▼ Basics  ███  │
│  │                                                  │ │  ▼ Customer ██░ │
│  │           (scrollable)                           │ │  ▼ Values  █░░  │
│  │                                                  │ │  ▼ Voice   ░░░  │
│  │                                                  │ │  ▼ Position░░░  │
│  │                                                  │ │                 │
│  │                                                  │ │  ────────────   │
│  │                                                  │ │                 │
│  │                                                  │ │  [View Full]    │
│  │                                                  │ │                 │
│  └─────────────────────────────────────────────────┘ │                 │
│                                                       │                 │
│  ┌─────────────────────────────────────────────────┐ │                 │
│  │  Type your response...                      [→] │ │                 │
│  └─────────────────────────────────────────────────┘ │                 │
│                                                       │                 │
└───────────────────────────────────────────────────────┴─────────────────┘
```

**Desktop widths:**
- Chat area: 60-70% (max 700px)
- Side panel: 30-40% (min 280px)
- Side panel collapsible

### Layout — Mobile

```
┌─────────────────────────────────┐
│  Foundation   [Progress] [≡]   │
├─────────────────────────────────┤
│                                 │
│                                 │
│      CONVERSATION AREA          │
│                                 │
│      (full width, scrollable)   │
│                                 │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│  Type...                   [→] │
└─────────────────────────────────┘

[Progress] = tap to show progress sheet
[≡] = menu with settings, help, etc.
```

---

## Component: Chat Message (Assistant)

```
┌────────────────────────────────────────────────────────┐
│  🤖                                                    │
│                                                        │
│  Message text goes here. Can be multiple paragraphs.   │
│                                                        │
│  Second paragraph if needed.                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Specs:**
- Background: `var(--color-assistant-bubble)`
- Border radius: 16px (top-left: 4px)
- Padding: 16px
- Max width: 85% of chat area
- Font: `var(--text-base)`, `var(--leading-relaxed)`
- Avatar: Small icon, top-left aligned

---

## Component: Chat Message (User)

```
                        ┌────────────────────────────────┐
                        │                                │
                        │  User's response here.         │
                        │                                │
                        └────────────────────────────────┘
```

**Specs:**
- Background: `var(--color-user-bubble)`
- Text: `var(--color-user-text)`
- Border radius: 16px (top-right: 4px)
- Aligned right
- Max width: 75%
- Padding: 12px 16px

---

## Component: Word Bank (Inline)

Appears within assistant message flow.

```
┌────────────────────────────────────────────────────────┐
│  🤖                                                    │
│                                                        │
│  Pick 4-6 words that describe your brand personality:  │
│                                                        │
│  ┌───────────────────────────────────────────────────┐│
│  │                                                    ││
│  │  [ Warm ]  [ Bold ]  [ Expert ]  [ Playful ]     ││
│  │                                                    ││
│  │  [ Minimal ]  [ Approachable ]  [ Premium ]      ││
│  │                                                    ││
│  │  [ Innovative ]  [ Reliable ]  [ Edgy ]          ││
│  │                                                    ││
│  │  [ Calm ]  [ Energetic ]  [ Sophisticated ]      ││
│  │                                                    ││
│  └───────────────────────────────────────────────────┘│
│                                                        │
│               [ Continue with 4 selected ]             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Word chip specs:**
- Unselected: border only, `var(--color-border)`
- Selected: filled `var(--color-primary-light)`, border `var(--color-primary)`
- Hover: slight scale (1.02), shadow
- Click: satisfying haptic/visual feedback
- Border radius: 20px (pill shape)
- Padding: 8px 16px

**Behavior:**
- Multi-select (configurable min/max)
- Counter shows "4 selected" etc.
- Continue button enables when min reached
- Can type custom word (shows + input at end)

---

## Component: Slider Set (Inline)

```
┌────────────────────────────────────────────────────────┐
│  🤖                                                    │
│                                                        │
│  Where does your brand sit on these spectrums?         │
│                                                        │
│  ┌───────────────────────────────────────────────────┐│
│  │                                                    ││
│  │  Formal  ────────●────────────  Casual            ││
│  │                                                    ││
│  │  Serious ──────────────●──────  Playful           ││
│  │                                                    ││
│  │  Bold    ────●────────────────  Understated       ││
│  │                                                    ││
│  └───────────────────────────────────────────────────┘│
│                                                        │
│                      [ Continue ]                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Slider specs:**
- Track: 4px height, rounded, `var(--color-border)`
- Thumb: 20px circle, `var(--color-primary)`, shadow
- Labels: `var(--text-sm)`, `var(--color-text-secondary)`
- Default: center (5)
- Range: 1-10
- Drag: smooth, snaps to whole numbers

---

## Component: Binary Choice (Inline)

```
┌────────────────────────────────────────────────────────┐
│  🤖                                                    │
│                                                        │
│  Quick gut check:                                      │
│                                                        │
│  Your brand walks into a room. Does it...              │
│                                                        │
│  ┌─────────────────────┐  ┌─────────────────────┐     │
│  │                     │  │                     │     │
│  │   Work the room,    │  │   Find one person   │     │
│  │   talking to        │  │   for a deep        │     │
│  │   everyone          │  │   conversation      │     │
│  │                     │  │                     │     │
│  └─────────────────────┘  └─────────────────────┘     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Binary card specs:**
- Two cards side by side (stack on mobile)
- Unselected: white bg, subtle border
- Hover: slight lift, border color change
- Selected: `var(--color-primary-light)` bg, `var(--color-primary)` border
- Border radius: 12px
- Padding: 16px
- Click: immediate selection, auto-advance after brief delay

---

## Component: Inference Reveal Card

```
┌────────────────────────────────────────────────────────┐
│  🤖                                                    │
│                                                        │
│  Based on what you've shared, here's what I'm          │
│  picking up:                                           │
│                                                        │
│  ┌───────────────────────────────────────────────────┐│
│  │  ✨                                                ││
│  │                                                    ││
│  │  Your customers' deeper pain:                     ││
│  │                                                    ││
│  │  "They feel like frauds—worried they're not       ││
│  │   'legitimate' because they can't clearly         ││
│  │   articulate their value."                        ││
│  │                                                    ││
│  │                                                    ││
│  │  [ That's it! ]  [ Close, but... ]  [ Not quite ] ││
│  │                                                    ││
│  └───────────────────────────────────────────────────┘│
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Card specs:**
- Background: gradient or subtle pattern (feels special)
- Border: none (or very subtle)
- Sparkle icon: `✨` or custom icon
- Content: larger text, slightly indented like a quote
- Buttons: three options, primary styling on "That's it"

**"Close, but..." flow:**
- Opens text input below card
- "What would you adjust?"
- Submit updates the inference

---

## Component: Progress Side Panel

```
┌────────────────────────────────┐
│  YOUR FOUNDATION               │
│  ─────────────────────────     │
│                                │
│  ▼ Basics            ████████░ │
│    Business name     ✓         │
│    Industry          ✓         │
│    Stage             ✓         │
│    Background        ◐         │
│                                │
│  ▼ Customers         █████░░░░ │
│    Who they are      ✓         │
│    Their pain        ◐         │
│    Their desire      ○         │
│    Their journey     ○         │
│                                │
│  ▶ Values            ░░░░░░░░░ │
│  ▶ Voice             ░░░░░░░░░ │
│  ▶ Positioning       ░░░░░░░░░ │
│                                │
│  ─────────────────────────     │
│                                │
│  Overall: 35% complete         │
│                                │
│  [ View Full Foundation → ]    │
│                                │
└────────────────────────────────┘
```

**Specs:**
- Collapsible on desktop (toggle button)
- Bottom sheet on mobile (drag up)
- Bucket headers: clickable to expand/collapse
- Status icons: ✓ complete, ◐ partial, ○ empty
- Progress bars: thin, colored by completion
- "View Full" opens dashboard modal/page

---

## Component: Input Bar

```
┌────────────────────────────────────────────────────────────────┐
│  │  Type your response...                              [ → ]  │
└────────────────────────────────────────────────────────────────┘
```

**Specs:**
- Sticky at bottom of chat area
- Auto-grow textarea (max 4 lines before scroll)
- Send button: `var(--color-primary)`, icon only
- Disabled state when waiting for response
- Enter to send, Shift+Enter for newline

---

## Page: Foundation Dashboard

Full view of all fields, accessed from "View Full" or after completion.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Chat                     Your Brand Foundation       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────┐ │
│  │ BASICS       95%  │ │ CUSTOMERS    70%  │ │ VALUES   60%  │ │
│  │ ████████████████░ │ │ ██████████████░░░ │ │ ███████████░░ │ │
│  └───────────────────┘ └───────────────────┘ └───────────────┘ │
│                                                                 │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────┐ │
│  │ VOICE        85%  │ │ POSITIONING  45%  │ │ VISION   20%  │ │
│  │ ███████████████░░ │ │ ██████████░░░░░░░ │ │ ████░░░░░░░░░ │ │
│  └───────────────────┘ └───────────────────┘ └───────────────┘ │
│                                                                 │
│  ════════════════════════════════════════════════════════════  │
│                                                                 │
│  CUSTOMERS                                          [ Edit ▾ ] │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Who They Are                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Freelancers and solopreneurs, 28-45, in creative or     │   │
│  │ knowledge work. Ambitious but overwhelmed by choices.   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Confidence: High  •  From 4 conversation points               │
│                                                                 │
│  Their Deeper Pain                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ "Feel like frauds—worried they're not legitimate        │   │
│  │ because they can't articulate their value clearly."     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Confidence: High (confirmed)  •  [ Edit ]                     │
│                                                                 │
│  ...                                                            │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  GENERATED OUTPUTS                              [ Regenerate ] │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📝 One-Liners (6 options)                          [ View ]   │
│  💬 Benefit Statements                              [ View ]   │
│  📋 Brand Brief                                    [ Export ]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Animations & Micro-interactions

### Message Appearance
- Slide up + fade in (150ms, ease-out)
- Stagger multiple messages if batched

### Word Bank Selection
- Scale to 0.95 on press, bounce back
- Background color transition (100ms)
- Checkmark appears with scale animation

### Slider Drag
- Thumb scales slightly while dragging
- Value tooltip appears above thumb
- Haptic feedback on snap points (mobile)

### Inference Reveal
- Card slides in from bottom (200ms)
- Subtle shimmer/glow effect on appearance
- Sparkle icon animates once

### Progress Update
- Bar fills with smooth transition (300ms)
- Checkmark pops in with scale bounce

### Typing Indicator
- Three dots with staggered bounce
- Appears after 500ms delay (feels responsive)

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm: tablet */ }
@media (min-width: 768px)  { /* md: tablet landscape */ }
@media (min-width: 1024px) { /* lg: desktop, show side panel */ }
@media (min-width: 1280px) { /* xl: wide desktop */ }
```

---

## Accessibility

- All interactive elements keyboard accessible
- Focus states clearly visible
- Color contrast meets WCAG AA
- Screen reader labels for icons
- Reduced motion option respects `prefers-reduced-motion`
- Sliders have aria-valuetext

---

*Document version: 1.0*
