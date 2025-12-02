# Business Onboarder — Field Definitions

## Overview

This document defines all fields organized by bucket. Each field includes:
- What it captures
- Field type and validation
- Example values
- Which questions/interactions feed it
- Parser hints for extraction

---

## Bucket: BASICS
**Tier:** 1 (Foundation)
**Required:** Yes
**Description:** Factual information about the business. Low friction, mostly direct input.

### `business_name`
- **Display:** Business Name
- **Type:** short_text
- **Description:** The name of the business
- **Example:** "Foundation Studio"
- **Feeds from:** Direct question, URL scraping
- **Required:** Yes

### `business_stage`
- **Display:** Business Stage
- **Type:** tags (single select)
- **Options:** `idea`, `pre-launch`, `launched`, `growing`, `established`, `pivoting`
- **Description:** Current lifecycle stage
- **Feeds from:** Direct question, inferred from conversation
- **Required:** Yes

### `industry`
- **Display:** Industry/Category
- **Type:** tags (multi-select)
- **Description:** Primary industry or categories
- **Example:** ["SaaS", "Marketing", "AI"]
- **Feeds from:** Direct question, inferred
- **Required:** Yes

### `business_model`
- **Display:** Business Model
- **Type:** tags (single select)
- **Options:** `product`, `service`, `saas`, `marketplace`, `agency`, `consulting`, `content`, `hybrid`
- **Feeds from:** Direct question, inferred

### `founder_background`
- **Display:** Founder Background
- **Type:** long_text
- **Description:** Relevant experience, why this founder for this business
- **Example:** "10 years in marketing, frustrated by blank-page problem in client onboarding"
- **Feeds from:** Conversation, "tell me about yourself"
- **Parser hints:** Look for career history, frustrations, expertise

### `location`
- **Display:** Location
- **Type:** short_text
- **Description:** Where the business operates from
- **Feeds from:** Direct question

### `year_founded`
- **Display:** Year Founded
- **Type:** short_text
- **Description:** When the business started (or expected start)
- **Feeds from:** Direct question, inferred

### `team_size`
- **Display:** Team Size
- **Type:** short_text
- **Options hint:** `solo`, `2-5`, `6-20`, `21-50`, `50+`
- **Feeds from:** Direct question

---

## Bucket: CUSTOMERS
**Tier:** 2 (Audience)
**Required:** Yes
**Description:** Who the business serves. Critical for all downstream content.

### `customer_who_demographic`
- **Display:** Customer Demographics
- **Type:** long_text
- **Description:** Observable characteristics: age, profession, life stage, location
- **Example:** "Freelancers and solopreneurs, 28-45, typically in creative or knowledge work fields"
- **Feeds from:** Direct question, inferred from problem descriptions
- **Parser hints:** Extract concrete descriptors, not feelings

### `customer_who_psychographic`
- **Display:** Customer Mindset
- **Type:** long_text
- **Description:** How they think, what they believe, their attitudes
- **Example:** "Ambitious but overwhelmed. Value autonomy. Skeptical of 'guru' marketing. Want proof something works."
- **Feeds from:** Conversation about customer frustrations, word banks
- **Parser hints:** Look for belief statements, attitude language

### `customer_pain_surface`
- **Display:** Stated Problem
- **Type:** long_text
- **Description:** The problem customers would articulate themselves
- **Example:** "I don't have time to figure out my brand messaging"
- **Feeds from:** "What problem do you solve" questions
- **Parser hints:** Look for quotes, practical complaints

### `customer_pain_deep`
- **Display:** Underlying Pain
- **Type:** long_text
- **Description:** The emotional/psychological pain underneath
- **Example:** "Feeling like a fraud, worried they're not 'legitimate' without polished branding"
- **Feeds from:** Inferred by Customer Empathy Analyzer
- **Parser hints:** Emotional language, fears, identity concerns

### `customer_desire_stated`
- **Display:** What They Say They Want
- **Type:** long_text
- **Description:** The explicit goal or outcome customers express
- **Example:** "A clear brand guide and messaging framework"
- **Feeds from:** Conversation about outcomes

### `customer_desire_true`
- **Display:** What They Actually Want
- **Type:** long_text
- **Description:** The deeper desire (status, feeling, identity)
- **Example:** "To feel confident and credible when talking about their business"
- **Feeds from:** Inferred by analyzer
- **Parser hints:** Status, emotion, identity language

### `customer_journey_awareness`
- **Display:** How They Realize the Problem
- **Type:** long_text
- **Description:** Trigger moments when they recognize the need
- **Example:** "When they're asked 'so what do you do?' and stumble through an answer"
- **Feeds from:** "When do people realize they need this" questions

### `customer_journey_consideration`
- **Display:** How They Evaluate Options
- **Type:** long_text
- **Description:** What they compare, what matters in their decision
- **Example:** "Look for templates first, then consultants. Price sensitive but will pay for 'done for you'"
- **Feeds from:** Conversation about competition, past solutions tried

### `customer_alternatives`
- **Display:** Current Alternatives
- **Type:** long_text
- **Description:** What they do instead of using your solution
- **Example:** "DIY with Canva, hire expensive agency, avoid the problem entirely"
- **Feeds from:** "What do people do now without you" questions

---

## Bucket: VALUES
**Tier:** 3 (Identity)
**Required:** Yes
**Description:** What the business stands for. Often inferred more than stated.

### `values_core`
- **Display:** Core Values
- **Type:** tags (multi-select, 3-7 items)
- **Description:** The non-negotiable principles
- **Example:** ["Authenticity", "Accessibility", "Craft", "Empowerment"]
- **Feeds from:** Word bank selection, inferred from conversation
- **Parser hints:** Look for repeated themes, what they emphasize

### `values_beliefs`
- **Display:** Core Beliefs
- **Type:** long_text
- **Description:** Fundamental beliefs about the world/industry
- **Example:** "We believe every business has a unique story worth telling. We believe AI should augment human creativity, not replace it."
- **Feeds from:** "What do you believe that others don't" questions, inferred
- **Parser hints:** "I believe..." "We think..." "[Industry] should..."

### `values_stands_against`
- **Display:** What We Stand Against
- **Type:** long_text
- **Description:** What the brand opposes or rejects
- **Example:** "Generic templates that make every business sound the same. 'Hustle culture' marketing."
- **Feeds from:** "What frustrates you about your industry" questions
- **Parser hints:** Negative language, frustration, criticism

### `values_aspirational`
- **Display:** Aspirational Values
- **Type:** tags (multi-select)
- **Description:** Values they're working toward but haven't fully embodied
- **Example:** ["Thought leadership", "Community"]
- **Feeds from:** Inferred from gaps between stated and demonstrated

---

## Bucket: VOICE
**Tier:** 3 (Identity)
**Required:** Yes
**Description:** How the brand sounds and shows up.

### `personality_tags`
- **Display:** Brand Personality
- **Type:** tags (multi-select, 4-6 items)
- **Description:** Adjectives that describe the brand's character
- **Example:** ["Warm", "Expert", "Playful", "Direct"]
- **Feeds from:** Word bank, inferred from founder's communication style

### `voice_spectrum_formal`
- **Display:** Formality Level
- **Type:** scale (1-10)
- **Description:** 1 = very casual, 10 = very formal
- **Feeds from:** Slider interaction

### `voice_spectrum_playful`
- **Display:** Playfulness Level
- **Type:** scale (1-10)
- **Description:** 1 = serious/straight, 10 = playful/witty
- **Feeds from:** Slider interaction

### `voice_spectrum_bold`
- **Display:** Boldness Level
- **Type:** scale (1-10)
- **Description:** 1 = understated/subtle, 10 = bold/provocative
- **Feeds from:** Slider interaction

### `voice_spectrum_technical`
- **Display:** Technical Level
- **Type:** scale (1-10)
- **Description:** 1 = accessible/simple, 10 = expert/technical
- **Feeds from:** Slider interaction

### `tone_situations`
- **Display:** Tone by Situation
- **Type:** json
- **Description:** How tone shifts in different contexts
- **Structure:** `{ "marketing": "...", "support": "...", "error": "...", "celebration": "..." }`
- **Feeds from:** Scenario-based questions

### `voice_donts`
- **Display:** Voice Don'ts
- **Type:** long_text
- **Description:** What the brand should never sound like
- **Example:** "Never condescending. Never use jargon without explaining. Never 'guru-speak'."
- **Feeds from:** "What do you hate in other brand voices" questions

---

## Bucket: POSITIONING
**Tier:** 3 (Identity)
**Required:** Yes
**Description:** How the brand differentiates and positions in the market.

### `differentiator_primary`
- **Display:** Primary Differentiator
- **Type:** long_text
- **Description:** The main thing that makes this business different
- **Example:** "Conversational AI that infers your brand from natural dialogue—no forms, no blank pages"
- **Feeds from:** "What makes you different" questions, inferred

### `differentiator_secondary`
- **Display:** Secondary Differentiators
- **Type:** json (array)
- **Description:** Other meaningful differences
- **Example:** ["Built by marketers who felt the pain", "Integrates with your existing tools"]
- **Feeds from:** Conversation about features, approach

### `positioning_statement`
- **Display:** Positioning Statement
- **Type:** long_text
- **Description:** Formal positioning statement
- **Template:** "For [target] who [need], [brand] is the [category] that [benefit] because [reason to believe]."
- **Feeds from:** Generated from other fields, refined with user

### `competitive_landscape`
- **Display:** Competitive Context
- **Type:** long_text
- **Description:** Who else serves this need, how you're different
- **Example:** "Alternatives include: StoryBrand (framework, expensive), Canva (DIY, generic), agencies (costly, slow)"
- **Feeds from:** Competition questions

### `category_owned`
- **Display:** Category to Own
- **Type:** short_text
- **Description:** The category or space the brand wants to define
- **Example:** "Conversational brand onboarding"
- **Feeds from:** Inferred, refined with user

---

## Bucket: VISION
**Tier:** 4 (Vision)
**Required:** No (builds over time)
**Description:** Future-oriented elements. Often emerge rather than being asked directly.

### `mission_statement`
- **Display:** Mission Statement
- **Type:** long_text
- **Description:** What the business does and why it matters
- **Example:** "We help founders find their voice so they can share their vision with the world."
- **Feeds from:** Generated, refined

### `vision_statement`
- **Display:** Vision Statement
- **Type:** long_text
- **Description:** The future state the business is working toward
- **Example:** "A world where every business can articulate its value as clearly as the big brands do."
- **Feeds from:** "What does success look like in 10 years" questions

### `impact_statement`
- **Display:** Impact Statement
- **Type:** long_text
- **Description:** The change the business creates in the world
- **Feeds from:** Inferred from values and mission

### `growth_goals`
- **Display:** Growth Goals
- **Type:** json
- **Description:** Concrete goals for the near future
- **Structure:** `{ "6_month": "...", "1_year": "...", "3_year": "..." }`
- **Feeds from:** Direct questions when relevant

---

## Summary: Field Count by Bucket

| Bucket | Fields | Required |
|--------|--------|----------|
| Basics | 8 | Yes |
| Customers | 9 | Yes |
| Values | 4 | Yes |
| Voice | 7 | Yes |
| Positioning | 5 | Yes |
| Vision | 4 | No |
| **Total** | **37** | — |

---

## Confidence Scoring Rules

Each field gets a confidence score based on:

- **high:** Direct user input OR confirmed inference with user agreement
- **medium:** Strong inference from multiple conversation points, not yet confirmed
- **low:** Single inference point, or conflicting signals
- **none:** No data yet

Confidence upgrades:
- Inference confirmed → high
- Multiple analyzers agree → medium (or high if strong)
- User edits directly → high

---

*Document version: 1.0*
