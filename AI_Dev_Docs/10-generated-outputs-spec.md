# Business Onboarder — Generated Outputs Specification

## Overview

Once the foundation has sufficient data, we can generate valuable outputs: one-liners, benefit statements, brand briefs, etc. These are the "magic moments" that make the onboarding valuable.

---

## Output Types

| Output | Description | Min Fields Required | Regeneratable |
|--------|-------------|---------------------|---------------|
| One-Liners | 6 short descriptions of the business | basics, customers | Yes |
| Benefit Statements | "So that I can..." from customer POV | customers, positioning | Yes |
| CTA Questions | "Wouldn't you like to..." hooks | customers, positioning | Yes |
| Positioning Statement | Formal positioning template | all core fields | Yes |
| Brand Brief | Comprehensive summary doc | 70%+ completion | Yes |
| Messaging Framework | Tone, voice, do's/don'ts | voice, values | Yes |

---

## Output: One-Liners

**Purpose:** Quick descriptions of the business for bios, intros, elevator pitches.

**Required fields:**
- `business_name`
- `industry`
- `customer_who_demographic`
- `customer_pain_surface`
- `differentiator_primary`

### Generation Prompt

```
Generate 6 one-liner descriptions for {business_name}.

Each one-liner should:
- Be 1-2 sentences max
- Be immediately understandable
- Highlight a different angle (problem, solution, outcome, audience, differentiator, mission)

Business context:
- Industry: {industry}
- Customer: {customer_who_demographic}
- Problem solved: {customer_pain_surface}
- Key differentiator: {differentiator_primary}
- Values: {values_core}

Generate 6 distinct one-liners, each taking a different angle:
1. Problem-focused
2. Solution-focused
3. Outcome-focused
4. Audience-focused
5. Differentiator-focused
6. Mission-focused

Output as JSON array of strings.
```

### Output Schema

```json
{
  "type": "one_liner",
  "content": {
    "options": [
      "Problem-focused one-liner here",
      "Solution-focused one-liner here",
      "..."
    ],
    "angles": ["problem", "solution", "outcome", "audience", "differentiator", "mission"]
  }
}
```

---

## Output: Benefit Statements

**Purpose:** Customer-centric value propositions using "So that I can..." format.

**Required fields:**
- `customer_who_demographic`
- `customer_pain_surface`
- `customer_desire_stated`
- `customer_desire_true`
- `differentiator_primary`

### Generation Prompt

```
Generate customer benefit statements for {business_name}.

Format: "[specific feature/service/offering] so that I can [customer outcome]"

Write from the customer's first-person perspective. Focus on psychological 
end-benefits, not just functional outcomes.

Example (do NOT use): "Free Worksheets so that I can figure out what problems I really need to solve."

Business context:
- What they offer: {brief_description}
- Customer: {customer_who_demographic}
- Customer mindset: {customer_who_psychographic}
- Surface problem: {customer_pain_surface}
- Deep desire: {customer_desire_true}
- Key offerings/features: {differentiator_primary}, {differentiator_secondary}

Generate 6 benefit statements, each highlighting different:
- Features or aspects of the offering
- Customer outcomes (mix functional and emotional)

Be clever and insightful. Focus on what customers REALLY want to feel or achieve.

Output as JSON array of objects with "feature" and "benefit" keys.
```

### Output Schema

```json
{
  "type": "benefit_statement",
  "content": {
    "statements": [
      {
        "feature": "Conversational AI onboarding",
        "benefit": "finally articulate my brand without staring at a blank page",
        "full": "Conversational AI onboarding so that I can finally articulate my brand without staring at a blank page"
      },
      ...
    ]
  }
}
```

---

## Output: CTA Questions

**Purpose:** Hook questions for marketing, flipping benefit statements into "Wouldn't you like to..." format.

**Required fields:** Same as Benefit Statements (generated FROM benefit statements)

### Generation Prompt

```
Convert these benefit statements into compelling hook questions.

Format: "Wouldn't you like to [outcome]?" or "What if you could [outcome]?"

Benefit statements:
{benefit_statements}

For each, create a hook question that:
- Speaks directly to the customer's desire
- Creates curiosity or FOMO
- Sounds natural, not salesy

Output as JSON array matching the order of input statements.
```

### Output Schema

```json
{
  "type": "cta_question",
  "content": {
    "questions": [
      "What if you could finally articulate your brand without the blank page struggle?",
      "Wouldn't you like to sound as confident as you feel about your business?",
      ...
    ]
  }
}
```

---

## Output: Positioning Statement

**Purpose:** Formal positioning using standard template.

**Required fields:**
- `customer_who_demographic`
- `customer_pain_surface`
- `business_name`
- `category_owned`
- `differentiator_primary`
- `values_beliefs`

### Template

```
For [target customer]
who [problem/need],
[brand name] is the [category]
that [key benefit]
because [reason to believe].
```

### Generation Prompt

```
Create a positioning statement for {business_name} using this template:

"For [target] who [need], [brand] is the [category] that [benefit] because [reason to believe]."

Inputs:
- Target: {customer_who_demographic}
- Need: {customer_pain_surface}
- Brand: {business_name}
- Category: {category_owned}
- Key benefit: {differentiator_primary}
- Reason to believe: {values_beliefs}, {founder_background}

Generate 3 versions:
1. Concise (under 30 words)
2. Detailed (under 50 words)
3. Conversational (how you'd say it out loud)

Output as JSON with three versions.
```

### Output Schema

```json
{
  "type": "positioning_statement",
  "content": {
    "concise": "For freelancers who struggle to articulate their value...",
    "detailed": "For freelancers and solopreneurs who feel stuck...",
    "conversational": "We help freelancers figure out how to talk about..."
  }
}
```

---

## Output: Brand Brief

**Purpose:** Comprehensive summary document, exportable.

**Required fields:** 70%+ overall completion

### Structure

```markdown
# Brand Brief: {business_name}

## The Business
{business overview from basics bucket}

## Our Customer
### Who They Are
{customer_who_demographic}
{customer_who_psychographic}

### What They're Struggling With
{customer_pain_surface}

### What They Really Want
{customer_desire_true}

## Our Identity
### Core Values
{values_core}

### What We Believe
{values_beliefs}

### What We Stand Against
{values_stands_against}

## Our Voice
### Personality
{personality_tags}

### Tone Spectrum
- Formality: {spectrum_formal}/10
- Playfulness: {spectrum_playful}/10
- Boldness: {spectrum_bold}/10

### Voice Don'ts
{voice_donts}

## Our Position
### What Makes Us Different
{differentiator_primary}

### Our Category
{category_owned}

### Positioning Statement
{positioning_statement}

## Quick Reference
### One-Liners
{one_liners}

### Benefit Statements
{benefit_statements}

---
Generated by Foundation Studio
{date}
```

### Output Schema

```json
{
  "type": "brand_brief",
  "content": {
    "markdown": "# Brand Brief: ...",
    "sections": {
      "business": { ... },
      "customer": { ... },
      "identity": { ... },
      "voice": { ... },
      "position": { ... }
    }
  }
}
```

---

## Output: Messaging Framework

**Purpose:** Guide for consistent brand communication.

**Required fields:**
- All voice fields
- Values fields
- Personality tags

### Generation Prompt

```
Create a messaging framework for {business_name}.

Voice Profile:
- Personality: {personality_tags}
- Formality: {voice_spectrum_formal}/10
- Playfulness: {voice_spectrum_playful}/10
- Boldness: {voice_spectrum_bold}/10

Values:
- Core: {values_core}
- Beliefs: {values_beliefs}
- Stands against: {values_stands_against}

Generate a framework with:

1. VOICE SUMMARY (2-3 sentences describing the overall voice)

2. DO's (5-7 specific, actionable guidelines)
   Example: "Use contractions to keep it casual"
   Example: "Lead with customer outcomes, not features"

3. DON'Ts (5-7 specific anti-patterns)
   Example: "Never use jargon without explaining it"
   Example: "Avoid passive voice"

4. WORD BANK
   - Words to use often (10-15)
   - Words to avoid (10-15)

5. EXAMPLE REWRITES
   - 3 "before/after" examples showing generic → on-brand

Output as structured JSON.
```

### Output Schema

```json
{
  "type": "messaging_framework",
  "content": {
    "voice_summary": "...",
    "dos": ["...", "..."],
    "donts": ["...", "..."],
    "word_bank": {
      "use": ["...", "..."],
      "avoid": ["...", "..."]
    },
    "examples": [
      {
        "before": "We provide solutions...",
        "after": "We help you..."
      }
    ]
  }
}
```

---

## Generation Triggers

### Automatic Generation
- When bucket completion crosses threshold
- After significant field updates

### Manual Generation
- User clicks "Generate" in dashboard
- User clicks "Regenerate" on existing output

### Generation Queue

```typescript
const checkGenerationTriggers = async (businessId: string) => {
  const completion = await getOverallCompletion(businessId);
  const fields = await getFields(businessId);
  
  // One-liners: basics + customers
  if (hasRequiredFields(fields, ['business_name', 'customer_who_demographic', 'customer_pain_surface'])) {
    if (!hasRecentOutput(businessId, 'one_liner')) {
      await queueGeneration(businessId, 'one_liner');
    }
  }
  
  // Benefit statements: need positioning too
  if (hasRequiredFields(fields, ['customer_desire_true', 'differentiator_primary'])) {
    if (!hasRecentOutput(businessId, 'benefit_statement')) {
      await queueGeneration(businessId, 'benefit_statement');
    }
  }
  
  // Brand brief: need 70%+
  if (completion >= 70) {
    await queueGeneration(businessId, 'brand_brief');
  }
};
```

---

## Regeneration Logic

When user regenerates:
1. Mark old output as replaced (`regenerated_from`)
2. Generate new with same inputs
3. Compare to ensure variety (don't repeat)
4. Store new output

```typescript
const regenerateOutput = async (outputId: string) => {
  const existing = await getOutput(outputId);
  
  // Get fresh field values
  const fields = await getFields(existing.business_id);
  
  // Generate with instruction to vary from previous
  const newContent = await generateOutput(existing.output_type, fields, {
    avoidSimilarTo: existing.content
  });
  
  // Save new output
  await saveOutput({
    business_id: existing.business_id,
    output_type: existing.output_type,
    content: newContent,
    source_field_ids: Object.keys(fields),
    source_field_snapshot: fields,
    regenerated_from: outputId
  });
};
```

---

## Export Formats

### Brand Brief Export
- **Markdown** (.md) - default
- **PDF** - formatted, styled
- **Notion** - future integration
- **Google Docs** - future integration

### Individual Outputs
- **Copy to clipboard** - one-click
- **JSON** - for developers
- **CSV** - for spreadsheet users

---

## Adding New Output Types

1. Define output in this spec:
   - Purpose
   - Required fields
   - Generation prompt
   - Output schema

2. Add to database seed:
   - output_types enum (if applicable)

3. Implement generator:
   - `lib/outputs/generators/{outputType}.ts`
   
4. Add UI:
   - Card in outputs section
   - View modal
   - Regenerate button

---

*Document version: 1.0*
