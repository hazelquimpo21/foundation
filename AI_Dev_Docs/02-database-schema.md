# Business Onboarder — Database Schema

## Overview

Supabase (Postgres) backend. Schema designed for:
- Session management and resumption
- Granular field tracking with confidence scores
- Audit trail of what fed each field
- Future extensibility (new buckets, new fields)

---

## Core Tables

### `users`

Basic user account. Kept minimal—profile data lives in the foundation.

```sql
users
├── id: uuid (PK, default: gen_random_uuid())
├── email: text (unique, not null)
├── created_at: timestamptz (default: now())
├── last_seen_at: timestamptz
└── preferences: jsonb (default: '{}')
    -- {
    --   "pace": "thorough" | "fast",
    --   "prefers_typing": boolean,
    --   "theme": "light" | "dark"
    -- }
```

### `businesses`

One user can have multiple businesses (future). Each business has one foundation.

```sql
businesses
├── id: uuid (PK)
├── user_id: uuid (FK → users.id)
├── name: text
├── created_at: timestamptz
├── updated_at: timestamptz
├── status: text (default: 'active')
│   -- 'active' | 'archived'
└── metadata: jsonb (default: '{}')
    -- extensible, future fields
```

### `onboarding_sessions`

Each conversation session. Users may have multiple sessions per business (restarts, revisions).

```sql
onboarding_sessions
├── id: uuid (PK)
├── business_id: uuid (FK → businesses.id)
├── started_at: timestamptz (default: now())
├── last_active_at: timestamptz
├── completed_at: timestamptz (nullable)
├── status: text (default: 'active')
│   -- 'active' | 'paused' | 'completed' | 'abandoned'
├── current_focus_bucket: text (nullable)
│   -- soft guidance for conversation flow
├── conversation_summary: text (nullable)
│   -- AI-generated summary for context restoration
└── session_metadata: jsonb (default: '{}')
    -- {
    --   "message_count": number,
    --   "interaction_count": number,
    --   "skipped_buckets": string[],
    --   "avg_response_length": number
    -- }
```

### `conversation_messages`

Full conversation history. Never deleted, used for re-analysis.

```sql
conversation_messages
├── id: uuid (PK)
├── session_id: uuid (FK → onboarding_sessions.id)
├── sequence: integer (not null)
│   -- order in conversation, for reconstruction
├── role: text (not null)
│   -- 'user' | 'assistant' | 'system'
├── content: text (not null)
├── message_type: text (default: 'text')
│   -- 'text' | 'word_bank_response' | 'slider_response' | 'binary_choice' | 'inference_confirm' | 'inference_reject'
├── interaction_data: jsonb (nullable)
│   -- for non-text messages: { selected_words: [], slider_values: {}, etc. }
├── created_at: timestamptz (default: now())
└── buckets_touched: text[] (default: '{}')
    -- which buckets this message was relevant to (from classifier)
```

---

## Foundation Fields Tables

### `field_buckets`

Registry of bucket types. Schema-driven, not hardcoded.

```sql
field_buckets
├── id: text (PK)
│   -- 'basics' | 'customers' | 'values' | 'voice' | 'positioning' | 'vision'
├── display_name: text
├── description: text
├── display_order: integer
├── tier: integer
│   -- 1 = foundation, 2 = audience, 3 = identity, 4 = vision
├── is_required: boolean (default: true)
└── min_completion_percent: integer (default: 50)
    -- threshold to consider "good enough"
```

### `field_definitions`

Registry of all fields. Add new fields without code changes.

```sql
field_definitions
├── id: text (PK)
│   -- 'business_name' | 'customer_pain_surface' | etc.
├── bucket_id: text (FK → field_buckets.id)
├── display_name: text
├── description: text
├── field_type: text
│   -- 'short_text' | 'long_text' | 'tags' | 'scale' | 'json'
├── is_required: boolean (default: false)
├── display_order: integer
├── validation_rules: jsonb (nullable)
│   -- { "max_length": 500, "min_items": 1, etc. }
└── parser_hints: jsonb (nullable)
    -- hints for the function-calling parser
    -- { "extract_as": "array", "look_for": "emotional language" }
```

### `foundation_fields`

Actual field values for each business. The core data.

```sql
foundation_fields
├── id: uuid (PK)
├── business_id: uuid (FK → businesses.id)
├── field_id: text (FK → field_definitions.id)
├── value: text (nullable)
│   -- stored as text, interpreted based on field_type
├── value_json: jsonb (nullable)
│   -- for complex fields (tags, structured data)
├── confidence: text (default: 'none')
│   -- 'none' | 'low' | 'medium' | 'high'
├── source_type: text
│   -- 'direct_input' | 'inferred' | 'confirmed_inference' | 'edited'
├── created_at: timestamptz
├── updated_at: timestamptz
└── source_message_ids: uuid[] (default: '{}')
    -- which messages contributed to this value
```

---

## Analysis Pipeline Tables

### `analysis_jobs`

Queue and history of analyzer runs.

```sql
analysis_jobs
├── id: uuid (PK)
├── session_id: uuid (FK → onboarding_sessions.id)
├── analyzer_type: text (not null)
│   -- 'customer_empathy' | 'values_inferrer' | 'voice_detector' | etc.
├── status: text (default: 'pending')
│   -- 'pending' | 'processing' | 'completed' | 'failed'
├── input_message_ids: uuid[] (not null)
│   -- which messages are being analyzed
├── input_context: jsonb (nullable)
│   -- additional context passed to analyzer
├── output_analysis: text (nullable)
│   -- the raw prose analysis from GPT
├── created_at: timestamptz
├── started_at: timestamptz (nullable)
├── completed_at: timestamptz (nullable)
└── error_message: text (nullable)
```

### `parsing_jobs`

Queue and history of parser runs (analysis → structured fields).

```sql
parsing_jobs
├── id: uuid (PK)
├── analysis_job_id: uuid (FK → analysis_jobs.id)
├── status: text (default: 'pending')
│   -- 'pending' | 'processing' | 'completed' | 'failed'
├── output_fields: jsonb (nullable)
│   -- the structured extraction: { "field_id": "value", ... }
├── created_at: timestamptz
├── completed_at: timestamptz (nullable)
└── fields_updated: text[] (default: '{}')
    -- which field_ids were updated from this parse
```

### `inference_reveals`

Insights queued to show the user for confirmation.

```sql
inference_reveals
├── id: uuid (PK)
├── session_id: uuid (FK → onboarding_sessions.id)
├── field_id: text (FK → field_definitions.id)
├── inferred_value: text
├── display_text: text
│   -- human-friendly version for the reveal card
├── confidence: text
├── source_analysis_id: uuid (FK → analysis_jobs.id)
├── status: text (default: 'pending')
│   -- 'pending' | 'shown' | 'confirmed' | 'rejected' | 'edited'
├── user_response: text (nullable)
│   -- if edited, what they changed it to
├── created_at: timestamptz
└── resolved_at: timestamptz (nullable)
```

---

## Generated Outputs Table

### `generated_outputs`

Stores generated content (one-liners, benefit statements, etc.)

```sql
generated_outputs
├── id: uuid (PK)
├── business_id: uuid (FK → businesses.id)
├── output_type: text (not null)
│   -- 'one_liner' | 'benefit_statement' | 'so_that_i_can' | 'wouldnt_you_like' | 'brand_brief'
├── content: jsonb (not null)
│   -- structure varies by type
│   -- one_liner: { "options": ["...", "...", "..."] }
│   -- brand_brief: { "sections": {...} }
├── source_field_ids: text[] (default: '{}')
│   -- which fields fed this generation
├── source_field_snapshot: jsonb
│   -- snapshot of field values at generation time
├── is_favorite: boolean (default: false)
├── created_at: timestamptz
└── regenerated_from: uuid (nullable, FK → generated_outputs.id)
    -- if this is a regeneration, what it replaced
```

---

## Indexes

```sql
-- Fast session lookup
CREATE INDEX idx_sessions_business ON onboarding_sessions(business_id);
CREATE INDEX idx_sessions_status ON onboarding_sessions(status) WHERE status = 'active';

-- Message retrieval
CREATE INDEX idx_messages_session ON conversation_messages(session_id, sequence);

-- Field lookup
CREATE INDEX idx_fields_business ON foundation_fields(business_id);
CREATE INDEX idx_fields_lookup ON foundation_fields(business_id, field_id);

-- Analysis queue processing
CREATE INDEX idx_analysis_pending ON analysis_jobs(status) WHERE status = 'pending';
CREATE INDEX idx_parsing_pending ON parsing_jobs(status) WHERE status = 'pending';

-- Inference reveals
CREATE INDEX idx_reveals_session ON inference_reveals(session_id, status);
```

---

## Row Level Security (RLS)

```sql
-- Users can only access their own data
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their businesses" ON businesses
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their sessions" ON onboarding_sessions
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- Similar policies for all user-data tables...
```

---

## Field Definitions Seed Data

See `03-field-definitions.md` for the complete list of fields, their buckets, and metadata.

---

## Extensibility Notes

**Adding a new bucket:**
1. Insert row into `field_buckets`
2. Insert field definitions into `field_definitions`
3. No code changes needed—UI reads from schema

**Adding a new field to existing bucket:**
1. Insert row into `field_definitions`
2. Parser prompts may need updating to extract it

**Adding a new analyzer:**
1. Create analyzer prompt (see `07-analyzer-prompts.md`)
2. Register analyzer type in application config
3. Update orchestrator to include in batch runs

**Adding a new output type:**
1. Define output structure
2. Create generation prompt
3. Insert new `output_type` value

---

*Document version: 1.0*
