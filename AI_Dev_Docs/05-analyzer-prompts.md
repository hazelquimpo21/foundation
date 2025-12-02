# Business Onboarder — Analyzer Prompts

## Overview

Analyzers are the "inference layer" of the system. They read conversation chunks and produce **prose analysis**—thoughtful, narrative observations about what the conversation reveals.

**Critical principle:** Analyzers never output JSON. They write like a smart colleague taking notes. The parsing layer (function calling) extracts structure separately.

---

## Analyzer Architecture

```
┌─────────────────────────────────────────────────┐
│           CONVERSATION CHUNKS                   │
│  (3-5 messages, batched)                        │
└─────────────────────┬───────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Customer    │ │   Values     │ │    Voice     │
│  Empathy     │ │  Inferrer    │ │  Detector    │
│  Analyzer    │ │              │ │              │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────────────────────────────────────────┐
│           PROSE ANALYSES                        │
│  (stored in analysis_jobs.output_analysis)      │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│           PARSER (function calling)             │
│  (extracts structured fields)                   │
└─────────────────────────────────────────────────┘
```

---

## Analyzer: Customer Empathy

**Purpose:** Understand how well the founder knows their customer, and infer the customer's true pains and desires.

**Runs when:** Conversation touches Customers bucket

### Prompt

```
You're analyzing a founder's conversation about their business to understand 
their customer deeply. Your job is NOT to organize information—it's to INFER 
what's beneath the surface.

Read this conversation excerpt and write your observations about:

1. WHO THE CUSTOMER REALLY IS
   - What concrete details emerged about demographics?
   - More importantly: what mindset, attitudes, and beliefs did you pick up?
   - Does the founder speak about customers with genuine empathy or surface-level assumptions?

2. THE PAIN BENEATH THE PAIN
   - What problem did they articulate?
   - What's the EMOTIONAL or PSYCHOLOGICAL pain underneath?
   - Look for: fears, frustrations, identity concerns, status anxiety, feeling "behind"
   - What does the customer want to FEEL, not just achieve?

3. THE REAL DESIRE
   - What outcome did they describe?
   - What deeper desire might drive that? (status, belonging, competence, ease, control)
   - If the customer got everything they wanted, how would they feel about themselves?

4. GAPS AND CONTRADICTIONS
   - Where does the founder show deep understanding vs. surface assumptions?
   - Any contradictions worth exploring?
   - What questions remain unanswered?

Write your analysis as a thoughtful narrative. Be specific—quote key phrases that 
reveal insight. Be clever—notice what they DON'T say as much as what they do.

---

BUSINESS CONTEXT:
{business_name}: {brief_description}

CONVERSATION EXCERPT:
{conversation_chunk}

---

Write your analysis now. Be insightful and specific.
```

### Example Output

```
The founder describes customers as "freelancers and solopreneurs, usually 30-something" 
—fairly surface-level demographically. But then something interesting: they said these 
customers "feel like they should have figured this out by now." That's rich. The pain 
isn't just "I need better branding"—it's an identity wound. They feel like frauds, 
like they're not legitimate because they can't articulate their value.

I noticed the founder used "overwhelmed" three times. When talking about alternatives, 
they said customers "try templates and feel worse." So the DIY path actually deepens the 
shame—it confirms they "can't even do this simple thing."

The stated desire is "a clear brand guide." But the real desire? To feel confident when 
someone asks "so what do you do?" To not stumble. To feel like a real business owner. 
Status and identity are at the core here.

Gap: I don't have a clear picture of the customer's life situation—are they side-hustling 
or full-time? New to business or experienced-but-stuck? The pain might differ significantly.

The founder seems to genuinely understand the emotional journey—they might have lived it 
themselves. Worth exploring whether their origin story connects to this customer pain.
```

---

## Analyzer: Values Inferrer

**Purpose:** Identify the underlying values and beliefs of the business, distinguishing stated vs. operational values.

**Runs when:** Conversation touches Values bucket, or after substantial conversation

### Prompt

```
You're analyzing a founder's conversation to identify the deep values and beliefs 
driving their business. Look beyond what they SAY their values are—infer from HOW 
they talk, what they emphasize, and what they assume.

Analyze for:

1. EVIDENT VALUES
   - What values show up repeatedly in how they describe things?
   - What do they emphasize without being asked?
   - What makes them light up vs. what feels obligatory?
   
2. STATED VS. OPERATIONAL
   - If they explicitly stated values, do their other answers align?
   - What do they ACTUALLY prioritize based on decisions described?
   - Any gaps between aspirational and operational values?

3. BELIEFS ABOUT THE WORLD
   - What do they assume is "obvious" that reveals deep beliefs?
   - What frustrates them about the status quo?
   - What would they change about their industry if they could?

4. WHAT THEY STAND AGAINST
   - What language carries negative energy?
   - What practices or approaches do they reject?
   - Sometimes anti-values reveal more than positive ones.

5. CONTRADICTIONS OR TENSIONS
   - Any values in tension with each other?
   - Are they trying to be something they're not yet?

Write your analysis as a thoughtful narrative. Use specific evidence from the 
conversation. Note which values feel deeply held vs. aspirational.

---

BUSINESS CONTEXT:
{business_name}: {brief_description}

CONVERSATION EXCERPT:
{conversation_chunk}

---

Write your analysis now.
```

---

## Analyzer: Voice Detector

**Purpose:** Identify the natural voice and personality of the brand based on how the founder communicates.

**Runs when:** Any substantial conversation (can run on founder's writing style)

### Prompt

```
You're analyzing a founder's conversation to identify their natural brand voice. 
The best brand voices are authentic extensions of the founder—your job is to notice 
how they naturally communicate and what personality emerges.

Analyze for:

1. NATURAL TONE
   - How do they write? Formal or casual? Long sentences or punchy?
   - Do they use humor? What kind?
   - How do they handle complexity—analogies, directness, stories?

2. PERSONALITY MARKERS
   - What adjectives would describe this person's communication style?
   - Are they warm or crisp? Bold or measured? Expert or accessible?
   - What would be different if someone else wrote this?

3. ENERGY AND PACE
   - Fast and energetic or thoughtful and measured?
   - Do they get excited? About what?
   - What slows them down or makes them careful?

4. UNIQUE PHRASES OR PATTERNS
   - Any distinctive word choices or phrases?
   - What metaphors or frameworks do they reach for?
   - How do they explain their business—features or feelings?

5. WHAT THEY'D NEVER SAY
   - Based on their style, what would feel wrong?
   - What corporate/marketing speak would clash with their voice?

Write a narrative capturing this brand's natural voice. Include specific 
examples from the conversation. Suggest where they'd land on spectrums 
(formal↔casual, playful↔serious, bold↔understated).

---

CONVERSATION EXCERPT:
{conversation_chunk}

---

Write your analysis now.
```

---

## Analyzer: Differentiation Detector

**Purpose:** Identify what makes this business genuinely different, cutting through generic positioning.

**Runs when:** Conversation touches Positioning bucket, or mentions competitors/alternatives

### Prompt

```
You're analyzing for genuine differentiation. Most businesses say generic things 
("we're better", "we care more"). Your job is to find what's ACTUALLY different—
specific choices, beliefs, or approaches that competitors can't or won't claim.

Analyze for:

1. STATED DIFFERENTIATORS
   - What do they claim makes them different?
   - Is it generic ("better quality") or specific ("we do X that no one else does")?
   - Push past the marketing speak to find substance.

2. HIDDEN DIFFERENTIATORS
   - What unique approaches emerged in how they describe their work?
   - What beliefs drive choices that competitors wouldn't make?
   - What are they doing that they might take for granted?

3. FOUNDER ADVANTAGE
   - Does their background give them unique insight or capability?
   - Is there a story that only they can tell?
   - What would be lost if someone else ran this business?

4. MARKET POSITIONING
   - How do they relate to alternatives (competitors, DIY, status quo)?
   - What do they criticize about how others do it?
   - What gap in the market are they filling?

5. POTENTIAL CATEGORY
   - Are they in an existing category or creating something new?
   - What would they want to be known as "the X that does Y"?

Be rigorous—if their differentiators are weak, say so. Note what's genuinely 
unique vs. what's table stakes. Identify where they could sharpen their positioning.

---

BUSINESS CONTEXT:
{business_name}: {brief_description}
Industry: {industry}

CONVERSATION EXCERPT:
{conversation_chunk}

---

Write your analysis now.
```

---

## Analyzer: Completeness Checker

**Purpose:** Assess what we know vs. what's missing, and identify the highest-value gaps.

**Runs when:** Periodically throughout conversation (every 5-7 messages)

### Prompt

```
You're reviewing the current state of a brand foundation conversation. Your job 
is to assess what we've learned and identify the most valuable gaps to fill next.

Review the current field states and conversation, then analyze:

1. WHAT'S SOLID
   - Which areas have clear, confident information?
   - What feels well-understood vs. surface-level?

2. CRITICAL GAPS
   - What essential information is missing?
   - What fields are empty or low-confidence?
   - Prioritize: what gap, if filled, would unlock the most value?

3. CONTRADICTIONS TO RESOLVE
   - Any inconsistencies in what's been captured?
   - Areas where the founder said different things at different times?

4. RECOMMENDED NEXT QUESTIONS
   - Based on gaps, what should we ask next?
   - Phrase as natural conversation, not form fields.
   - Consider what would be EASY for them to answer given what they've shared.

5. INFERENCE OPPORTUNITIES
   - What could we reasonably infer from existing information?
   - What should we show them for confirmation rather than asking directly?

Be strategic—not all gaps are equal. Focus on what would most improve the 
foundation's usefulness for downstream applications.

---

CURRENT FIELD STATES:
{field_states_summary}

CONVERSATION SO FAR:
{conversation_summary}

---

Write your analysis now.
```

---

## Analyzer: Session Summarizer

**Purpose:** Create a concise summary for session restoration and context passing.

**Runs when:** Session pauses, or before major transitions

### Prompt

```
Create a brief summary of this brand foundation conversation for context restoration.
Someone returning to this session should quickly understand: where we are, 
what's established, and what the natural next step is.

Include:
1. Business overview (1-2 sentences)
2. What's been established (key facts and insights, bulleted)
3. Current conversation state (what were we just discussing?)
4. Natural next topic or question
5. Any notable moments (strong reactions, important revelations)

Keep it under 200 words. Optimize for someone picking up where they left off.

---

BUSINESS NAME: {business_name}

CONVERSATION:
{full_conversation}

FIELD STATES:
{field_states_summary}

---

Write the session summary now.
```

---

## Adding New Analyzers

To add a new analyzer:

1. **Define the purpose:** What does this analyzer uniquely detect or infer?
2. **Write the prompt:** Follow the pattern above—context, specific questions, narrative output
3. **Determine triggers:** When should this analyzer run?
4. **Map to fields:** Which fields in the schema does this analyzer inform?
5. **Register in config:** Add to the analyzer registry (see Technical Architecture doc)

New analyzers should be **orthogonal**—detecting something the other analyzers don't, not duplicating effort.

### Future Analyzer Ideas

- **Emotional Tone Analyzer** — Detect founder's confidence, enthusiasm, uncertainty
- **Consistency Tracker** — Flag contradictions between early and late statements
- **Story Detector** — Identify narratives and anecdotes worth preserving
- **Red Flag Spotter** — Notice potential issues (unclear value prop, too broad audience)

---

*Document version: 1.0*
