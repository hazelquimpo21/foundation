# Business Onboarder — Question & Interaction Bank

## Overview

This document defines all questions, prompts, and interactive elements. Each item includes:
- The actual content (question text, word options, etc.)
- Which fields it feeds
- When it should appear (triggers)
- Variants for different contexts

---

## Interaction Types

1. **Open Question** — Free text response
2. **Word Bank** — Select multiple from options
3. **Slider** — Position on spectrum
4. **Binary Choice** — This or that
5. **Sentence Starter** — Complete the sentence
6. **Inference Reveal** — Confirm/reject/edit system inference

---

## Opening Sequence

### First Message (Always)

**Type:** Open Question (warm, low-pressure)

```
Let's build your brand foundation together. By the end of our conversation, 
you'll have clarity on who you are, who you serve, and how to talk about it.

First—what's your business called, and what does it do? 
Don't worry about being polished. Just tell me like you'd tell a friend.
```

**Feeds:** `business_name`, `industry` (inferred), initial signal for all buckets
**Next:** Based on response length and content

### If Short/Minimal Response

```
Got it! [Business name] sounds interesting. 
Tell me a bit more—what's the core thing you help people with?
```

### If Long/Detailed Response

```
Love the energy! I'm already picking up some themes I want to explore.
Let me ask: how long have you been working on this? Is it live, or still coming together?
```

**Feeds:** `business_stage`, `year_founded`

---

## Bucket: BASICS

### Business Stage

**Type:** Word Bank (single select)

```
Where is [business_name] in its journey right now?

[ Just an idea ]  [ Building it ]  [ Recently launched ]
[ Up and running ]  [ Been at this a while ]  [ Pivoting/evolving ]
```

**Feeds:** `business_stage`

### Founder Story

**Type:** Open Question

```
What's your background? What led you to start this?
(No need for a formal bio—I'm curious what experiences shaped this idea.)
```

**Feeds:** `founder_background`
**Trigger:** After basics established, or if user mentions "I" / their experience

### Business Model

**Type:** Binary Choice sequence

```
Quick one—how does [business_name] make money?

Do you sell a product or a service?
[ Product ]  [ Service ]  [ Both ]

Is it one-time purchase or recurring?
[ One-time ]  [ Recurring/subscription ]  [ Mix ]
```

**Feeds:** `business_model`

---

## Bucket: CUSTOMERS

### Customer Who (Opener)

**Type:** Open Question

```
Let's talk about who you serve. 

When you imagine your ideal customer—the one you love working with—who are they? 
What do they do? What's their life like?
```

**Feeds:** `customer_who_demographic`, `customer_who_psychographic`
**Parser hints:** Demographic = facts (age, job), Psychographic = attitudes/beliefs

### Customer Who (Follow-up: Psychographic)

**Type:** Word Bank (multi-select)

**Trigger:** After demographic info but thin on mindset

```
What words describe your ideal customer's mindset? Pick 4-6 that feel right.

[ Ambitious ]  [ Overwhelmed ]  [ Skeptical ]  [ Curious ]
[ Time-starved ]  [ DIY-minded ]  [ Willing to invest ]  [ Price-conscious ]
[ Perfectionist ]  [ Action-oriented ]  [ Cautious ]  [ Early adopter ]
[ Values quality ]  [ Wants it done for them ]  [ Loves learning ]
[ Frustrated with status quo ]  [ Optimistic ]  [ Pragmatic ]
```

**Feeds:** `customer_who_psychographic`

### Customer Pain (Surface)

**Type:** Open Question

```
What's the main problem your customers face that [business_name] solves?

Try to describe it in their words—how would *they* describe what's wrong?
```

**Feeds:** `customer_pain_surface`

### Customer Pain (Deep) — Inference Reveal

**Type:** Inference Reveal (not a direct question)

**Trigger:** After customer discussion, when analyzer has signal

```
🔮 Here's what I'm picking up...

Under the surface, your customers might be feeling:
"[Inferred deep pain]"

[ That's it exactly ]  [ Close, but... ]  [ Not quite ]
```

**Feeds:** `customer_pain_deep`
**On "Close, but..." or "Not quite":** Opens text input for correction

### Customer Desire

**Type:** Sentence Starter

```
Complete this from your customer's perspective:

"I wish I could just _______________"
```

**Feeds:** `customer_desire_stated`

### Customer Journey

**Type:** Open Question

```
Think about someone who eventually becomes your customer.
What's usually happening in their life when they realize they need something like [business_name]?
```

**Feeds:** `customer_journey_awareness`

### Customer Alternatives

**Type:** Open Question

```
Before they find you, what do people typically do to solve this problem?
(DIY, hire someone, ignore it, use a competitor...?)
```

**Feeds:** `customer_alternatives`, `competitive_landscape`

---

## Bucket: VALUES

### Values Word Bank

**Type:** Word Bank (multi-select, 5-7)

```
Let's find your brand's values. Pick 5-7 words that feel true to who you are—not who you think you should be.

**Character**
[ Authentic ]  [ Bold ]  [ Humble ]  [ Confident ]  [ Curious ]  [ Rebellious ]

**Approach**
[ Thoughtful ]  [ Fast-moving ]  [ Meticulous ]  [ Experimental ]  [ Practical ]  [ Visionary ]

**Relationship**
[ Collaborative ]  [ Independent ]  [ Supportive ]  [ Challenging ]  [ Warm ]  [ Professional ]

**Quality**
[ Craft-focused ]  [ Efficient ]  [ Premium ]  [ Accessible ]  [ Innovative ]  [ Reliable ]
```

**Feeds:** `values_core`

### Values Anti-Selection

**Type:** Word Bank (multi-select)

**Trigger:** After positive values selected

```
Now flip it—which of these would make you cringe if someone described your brand this way?

[ Salesy ]  [ Generic ]  [ Corporate ]  [ Trendy ]  [ Cheap ]  [ Complicated ]
[ Pushy ]  [ Boring ]  [ Exclusive ]  [ Chaotic ]  [ Cold ]  [ Preachy ]
```

**Feeds:** `values_stands_against`, `voice_donts`
**Note:** Anti-selections often reveal values more clearly than positive ones

### Beliefs

**Type:** Sentence Starter

```
What do you believe about your industry that most people don't?

"I believe _______________"
```

**Feeds:** `values_beliefs`

### Stands Against

**Type:** Open Question

```
What frustrates you about how things are usually done in your space?
What do you wish would change?
```

**Feeds:** `values_stands_against`

---

## Bucket: VOICE

### Personality Word Bank

**Type:** Word Bank (multi-select, 4-6)

```
If your brand were a person at a party, how would people describe them?

[ The expert everyone wants to talk to ]
[ The warm one who makes everyone comfortable ]
[ The witty one with great one-liners ]
[ The calm presence in the chaos ]
[ The bold one who says what others won't ]
[ The creative one with fresh ideas ]
[ The reliable one you can count on ]
[ The enthusiast who's genuinely excited ]
[ The thoughtful one who asks great questions ]
[ The straight-shooter who gives it to you direct ]
```

**Feeds:** `personality_tags`

### Voice Sliders

**Type:** Slider set

```
Where does your brand's voice sit on these spectrums?

Formal |----●----|----| Casual
Serious |--------|●---| Playful  
Understated |----●----|----| Bold
Expert |--------|----●| Approachable
Traditional |----●----|----| Innovative
```

**Feeds:** `voice_spectrum_formal`, `voice_spectrum_playful`, `voice_spectrum_bold`, `voice_spectrum_technical`

### Voice Don'ts

**Type:** Open Question

**Trigger:** After positive voice established

```
What should your brand *never* sound like?
Any tones, phrases, or styles that would feel totally wrong?
```

**Feeds:** `voice_donts`

### Brand Scenario — Binary

**Type:** Binary Choice

```
Quick gut checks on your brand's personality:

Your brand walks into a room. Does it...
[ Work the room, talking to everyone ]  [ Find one person for a deep conversation ]

When explaining something complex, do you...
[ Use analogies and stories ]  [ Get straight to the facts ]

If a customer is frustrated, should they feel...
[ Taken care of ]  [ Empowered to solve it themselves ]
```

**Feeds:** `personality_tags`, `tone_situations`

---

## Bucket: POSITIONING

### Differentiator

**Type:** Open Question

```
Here's a hard one: What makes [business_name] genuinely different?

Not "better"—different. What's true about your approach that competitors can't or won't say?
```

**Feeds:** `differentiator_primary`

### Differentiator Follow-up

**Type:** Open Question

**Trigger:** If first answer is generic ("better quality", "we care more")

```
I hear you. Let me push a bit—almost everyone says [their answer]. 

What's something *specific* about how you do things? 
A choice you made that others didn't? A belief that shapes your approach?
```

### Competition

**Type:** Open Question

```
When someone doesn't choose [business_name], what do they do instead?
(Competitors, DIY, agencies, ignoring the problem...?)
```

**Feeds:** `competitive_landscape`, `customer_alternatives`

### Category

**Type:** Binary + Open

```
If someone asked "what is [business_name]?"—how would you categorize it?

Is there an existing category you fit into?
[ Yes, it's a ___ ] → [text input]
[ Not really—it's a new thing ]

If new: What would you *want* people to call this category?
```

**Feeds:** `category_owned`

---

## Bucket: VISION

### Vision

**Type:** Open Question

**Trigger:** Later in conversation, after identity established

```
Let's zoom out. If [business_name] wildly succeeds...

What's different in the world 10 years from now because you existed?
```

**Feeds:** `vision_statement`

### Mission

**Type:** Inference Reveal (generated from other fields)

**Trigger:** When enough signal to generate

```
Based on everything you've shared, here's a draft mission statement:

"[Generated mission]"

[ Love it ]  [ Close, needs tweaking ]  [ Start over ]
```

**Feeds:** `mission_statement`

### Growth Goals

**Type:** Open Question

**Trigger:** Optional, late in conversation

```
What are you hoping to achieve in the next 6-12 months?
(Revenue, customers, product launches, whatever feels most relevant)
```

**Feeds:** `growth_goals`

---

## Transition Prompts

Between buckets, use natural transitions:

**Basics → Customers:**
```
Okay, I've got a good sense of what [business_name] is.
Now I'm curious about who it's for. Tell me about your people.
```

**Customers → Values:**
```
I'm getting a clear picture of who you serve. 
Let's talk about what you stand for—the beliefs behind the business.
```

**Values → Voice:**
```
Great values foundation. Now let's figure out how those show up in how you communicate.
```

**Voice → Positioning:**
```
I can hear your brand's voice now. Let's nail down what makes you different.
```

---

## Recovery Prompts

When conversation drifts or user seems stuck:

**Stuck on a question:**
```
No pressure on this one—skip it for now and we can come back. 
Want to try a different angle, or move on?
```

**Tangent detected:**
```
That's interesting context! Let me note that. 
Coming back to [topic]—[simpler version of question]?
```

**User seems frustrated:**
```
I hear you. Sometimes these questions are hard because you're too close to it.
Want me to show you what I've picked up so far? Sometimes seeing it helps.
```

---

*Document version: 1.0*
